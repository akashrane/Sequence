import pandas as pd
from engine.game import SequenceGame
from engine.ai import SequenceAI
from engine.models import Player
import time

class SimulationRunner:
    @staticmethod
    def run_batch(num_games: int, board_type: str, strategy_p1: str, strategy_p2: str, teams: bool = True):
        results = []
        
        print(f"Starting Batch Simulation: {num_games} games, {board_type} board, {strategy_p1} vs {strategy_p2}")
        
        start_time = time.time()
        
        for i in range(num_games):
            seed = i + int(time.time()) # Simple unique seed
            game = SequenceGame(num_players=2, board_type=board_type, teams=teams, seed=seed)
            game.players[0].strategy = strategy_p1
            game.players[1].strategy = strategy_p2
            
            turns = 0
            limit = 300 # Limit to prevent infinite stuck games
            
            while game.winner is None and turns < limit:
                current_p = game.current_player
                move = SequenceAI.get_move(game, current_p)
                
                if move:
                    idx, target = move
                    game.play_move(idx, target)
                else:
                    # Dead card check
                    dead_idx = game.find_dead_card(current_p.id)
                    if dead_idx is not None:
                        game.replace_dead_card(dead_idx)
                    else:
                        break # Stuck
                turns += 1
            
            # Record Stats
            winner = game.winner
            # Calculate Jack Usage if possible?
            # Scan log for Jack usage
            two_eyed = 0
            one_eyed = 0
            dead_card_swaps = 0
            
            for entry in game.log:
                if entry.get("action") == "dead_card":
                    dead_card_swaps += 1
                elif "card" in entry:
                    c_str = entry["card"]
                    if "J" in c_str:
                        # Crude check, Card object not stored in log as obj
                        # We need better logging or parsing
                        if "♥" in c_str or "♠" in c_str: one_eyed += 1 # Rough guess map to suits
                        else: two_eyed += 1
                        
            results.append({
                "game_id": i,
                "winner": winner if winner is not None else -1,
                "turns": turns,
                "two_eyed_jacks": two_eyed,
                "one_eyed_jacks": one_eyed,
                "dead_cards": dead_card_swaps
            })
            
            if (i+1) % 10 == 0:
                print(f"Completed {i+1}/{num_games} games...")
                
        elapsed = time.time() - start_time
        print(f"Batch finished in {elapsed:.2f}s")
        return pd.DataFrame(results)
