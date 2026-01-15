from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import uuid
import sys
import os

# Add root to path so we can import engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.game import SequenceGame
from engine.ai import SequenceAI
from engine.simulation import SimulationRunner
from backend.models import *
from backend.store import games

app = FastAPI(title="Sequence Game API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_state(game_id: str, game: SequenceGame) -> GameState:
    # Convert Board
    board_cells = []
    for r in range(10):
        row_cells = []
        for c in range(10):
            card = game.board.grid[r][c]
            state_val = game.board.state[r][c]
            locked = game.board.locked[r][c]
            is_corner = game.board.is_corner(r, c)
            
            c_model = None
            if card:
                c_model = CardModel(rank=card.rank.value, suit=card.suit.value, label=str(card))
                
            label = "FREE" if is_corner else (str(card) if card else "")
            
            row_cells.append(BoardCell(
                r=r, c=c,
                label=label,
                card=c_model,
                chipTeam=state_val,
                isLocked=locked,
                isCorner=is_corner
            ))
        board_cells.append(row_cells)

    # Convert Players
    p_models = []
    for p in game.players:
        hand_labels = [str(c) for c in p.hand]
        p_models.append(PlayerState(
            id=p.id,
            teamId=p.team_id,
            hand=hand_labels,
            isBot=p.is_bot
        ))

    return GameState(
        gameId=game_id,
        board=board_cells,
        players=p_models,
        currentTurnIndex=game.current_turn_index,
        currentPlayerId=game.current_player.id,
        currentTeamId=game.current_player.team_id,
        winnerTeam=game.winner,
        log=game.log[-10:], # Last 10 logs
        cardsLeft=len(game.deck.cards)
    )

@app.post("/api/game/new", response_model=GameState)
def new_game(req: NewGameRequest):
    game_id = str(uuid.uuid4())
    
    game = SequenceGame(
        num_players=req.nPlayers,
        board_type=req.boardType,
        teams=True, # Always teams for now
        seed=req.seed
    )
    
    # Setup Players
    for i, p in enumerate(game.players):
        # Teams logic: 0,1,0,1 or custom
        if req.teams and i < len(req.teams):
            p.team_id = req.teams[i]
        
        # AI Logic: For now, everyone except P0 is bot? Or explicit?
        # Let's say if nPlayers > 1, all are bots except possibly P0?
        # User requirement implies "Play" mode vs "AI Battle"
        # We'll just set strategy. The Frontend decides who is human (doesn't send Moves for bots).
        p.strategy = req.aiLevel
        
        # P0 is usually human in Play mode.
        # But for AI battle, we might want all bots.
        # We won't enforce "is_bot" flag strictly in Engine, Engine just has strategies.
        # We'll mark p0 as non-bot if needed? 
        # Actually Model has isBot. Let's assume P0 is Human by default unless we are in battle mode?
        # Easier: Frontend manages "Human-ness". Backend simply serves state.
    
    games[game_id] = game
    return serialize_state(game_id, game)

@app.get("/api/game/{game_id}/state", response_model=GameState)
def get_state(game_id: str):
    if game_id not in games: raise HTTPException(404, "Game not found")
    return serialize_state(game_id, games[game_id])

@app.get("/api/game/{game_id}/legal-moves", response_model=LegalMoveResponse)
def get_legal_moves(game_id: str, handIndex: int):
    if game_id not in games: raise HTTPException(404, "Game not found")
    game = games[game_id]
    
    moves = game.get_valid_moves(handIndex)
    
    # Determine Action Type
    player = game.current_player
    if handIndex >= len(player.hand):
        return LegalMoveResponse(actionType=ActionType.NONE, positions=[])
        
    card = player.hand[handIndex]
    a_type = ActionType.PLACE
    if card.is_two_eyed_jack: a_type = ActionType.TWO_EYED
    elif card.is_one_eyed_jack: a_type = ActionType.ONE_EYED
    
    pos_list = [{"r": r, "c": c} for r, c in moves]
    return LegalMoveResponse(actionType=a_type, positions=pos_list)

@app.post("/api/game/{game_id}/move", response_model=GameState)
def play_move(game_id: str, req: MoveRequest):
    if game_id not in games: raise HTTPException(404, "Game not found")
    game = games[game_id]
    
    success = game.play_move(req.handIndex, (req.pos['r'], req.pos['c']))
    if not success:
        raise HTTPException(400, "Invalid Move")
        
    return serialize_state(game_id, game)

@app.post("/api/game/{game_id}/replace-dead", response_model=GameState)
def replace_dead_card(game_id: str, req: MoveRequest): # Reusing MoveRequest for handIndex
    if game_id not in games: raise HTTPException(404, "Game not found")
    game = games[game_id]
    
    # Verify it's really dead
    player = game.current_player
    card_idx = req.handIndex
    if card_idx >= len(player.hand): raise HTTPException(400, "Invalid card index")
    
    card = player.hand[card_idx]
    
    # Check if dead
    if not game.board.is_dead_card(card, game.board):
         raise HTTPException(400, "Card is not dead")
         
    game.replace_dead_card(card)
    return serialize_state(game_id, game)

@app.post("/api/game/{game_id}/ai-step", response_model=GameState)
def ai_step(game_id: str, steps: int = Body(1, embed=True)):
    if game_id not in games: raise HTTPException(404, "Game not found")
    game = games[game_id]
    
    # Check for winner
    if game.winner is not None:
         return serialize_state(game_id, game)

    for _ in range(steps):
        if game.winner is not None: break
        
        p = game.current_player
        move = SequenceAI.get_move(game, p)
        if move:
            game.play_move(move[0], move[1])
        else:
            # Dead card?
            dead = game.find_dead_card(p.id)
            if dead is not None:
                game.replace_dead_card(dead)
            else:
                # Stuck? Break or Pass?
                # Engine doesn't support pass yet, assume game ends or stuck
                break
                
    return serialize_state(game_id, game)

@app.post("/api/simulate/monte-carlo")
def run_simulation(trials: int = Body(...), boardType: str = Body("standard"), aiLevel: str = Body("smart")):
    # Run simulation
    # We reuse SimulationRunner
    
    # We need to adapt SimulationRunner to return exact stats we need
    df = SimulationRunner.run_batch(trials, boardType, "smart", aiLevel)
    
    # Aggregate
    win_counts = df['winner'].value_counts().to_dict()
    avg_turns = df['turns'].mean()
    
    return {
        "games": trials,
        "win_rates": win_counts,
        "avg_turns": avg_turns,
        "stats": df.to_dict(orient="records")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
