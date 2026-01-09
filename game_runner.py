from engine.game import SequenceGame
from engine.ai import SequenceAI
from engine.models import Player
import time

def run_simulation():
    print("Initializing Sequence Game...")
    game = SequenceGame(num_players=2, board_type="standard")
    
    # Set up AI
    game.players[0].strategy = "random" # Player 1 Random
    game.players[1].strategy = "random" # Player 2 Random (for now)
    
    print("Starting Game Loop...")
    turn_limit = 200
    turn = 0
    
    while game.winner is None and turn < turn_limit:
        current_p = game.current_player
        print(f"Turn {turn}: Player {current_p.id} (Team {current_p.team_id}) thinking...")
        
        move = SequenceAI.get_move(game, current_p)
        
        if move:
            card_idx, target = move
            card = current_p.hand[card_idx]
            print(f"  Playing {card} at {target}")
            
            success = game.play_move(card_idx, target)
            if not success:
                print("  ERROR: Invalid move attempted!")
                break
            else:
                # Check dead cards for next player? Handled in AI or manual check
                pass
        else:
            # Dead card check
            dead_idx = game.find_dead_card(current_p.id)
            if dead_idx is not None:
                print(f"  Found dead card! Swapping {current_p.hand[dead_idx]}")
                game.replace_dead_card(dead_idx)
            else:
                print("  No moves and no dead cards?? Passing/Stuck.")
                break
        
        turn += 1
        
        # Visualize board (simple)
        # print_board(game)
        
    if game.winner is not None:
        print(f"GAME OVER! Winner: Team {game.winner}")
    else:
        print("Game limit reached or stuck.")

def print_board(game):
    print("Board State:")
    for r in range(10):
        row_str = ""
        for c in range(10):
            val = game.board.state[r][c]
            if val is None:
                row_str += ". "
            else:
                row_str += f"{val} "
        print(row_str)

if __name__ == "__main__":
    run_simulation()
