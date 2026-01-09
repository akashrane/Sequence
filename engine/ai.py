import random
from typing import Tuple, List, Optional
from .game import SequenceGame, Card, BoardState
from .models import Player

class DummyBoard:
    def __init__(self, original_board, new_state_grid):
        self.rows = 10
        self.cols = 10
        self.state = new_state_grid
        self.original = original_board
    def is_corner(self, r, c):
        return self.original.is_corner(r, c)

class SequenceAI:
    @staticmethod
    def get_move(game: SequenceGame, player: Player) -> Optional[Tuple[int, Tuple[int, int]]]:
        if player.strategy == "random":
            return SequenceAI.get_random_move(game, player)
        elif player.strategy == "smart":
            return SequenceAI.get_smart_move(game, player)
        return SequenceAI.get_random_move(game, player)

    @staticmethod
    def get_random_move(game, player):
        all_moves = []
        for i, card in enumerate(player.hand):
            valid_targets = game.get_valid_moves(i)
            for t in valid_targets:
                all_moves.append((i, t))
        
        if not all_moves:
            return None
        return random.choice(all_moves)

    @staticmethod
    def get_smart_move(game, player):
        moves = []
        for i, card in enumerate(player.hand):
            targets = game.get_valid_moves(i)
            for t in targets:
                moves.append((i, t))
        
        if not moves:
            return None

        def make_hypothetical_board(current_game, move, p_team):
            new_state = [row[:] for row in current_game.board.state]
            c_idx, (r, c) = move
            card = player.hand[c_idx]
            if card.is_one_eyed_jack:
                new_state[r][c] = None
            else:
                new_state[r][c] = p_team
            return DummyBoard(current_game.board, new_state)

        required = 2 if game.teams_mode and game.num_players % 2 == 0 else 1
        if game.num_players == 3: required = 1

        # 1. CHECK WIN
        for m in moves:
            hypo = make_hypothetical_board(game, m, player.team_id)
            if SequenceGame.count_sequences_on_board(hypo, player.team_id) >= required:
                return m

        # 2. BLOCK OPPONENT WIN (Crucial)
        opponent_team = (player.team_id + 1) % 2
        
        # Check if opponent is threatening a win (has 4/5 or similar)
        # Simplified: Check all empty spots. If filling one creates a win for Opponent, we MUST block it.
        threatening_spots = []
        for r in range(10):
            for c in range(10):
                if game.board.state[r][c] is None and not game.board.is_corner(r,c):
                    # Test opp placement
                    ns = [row[:] for row in game.board.state]
                    ns[r][c] = opponent_team
                    hypo_opp = DummyBoard(game.board, ns)
                    if SequenceGame.count_sequences_on_board(hypo_opp, opponent_team) >= required:
                        threatening_spots.append((r, c))
        
        # If threats exist, try to fill one
        if threatening_spots:
            for threat in threatening_spots:
                for m in moves:
                    c_idx, target = m
                    card = player.hand[c_idx]
                    if not card.is_one_eyed_jack and target == threat:
                        return m
            # If we can't fill, can we remove a piece using One-eyed?
            # Removing a piece from a winning line is impossible if the line is completed/locked.
            # But if they have 4, can we remove one of the 4?
            # This is complex to detect "which one of the 4".
            # For now, prioritize blocking placement.

        # 3. COMPLETE SEQUENCE (if not winning, but adds +1 to seq count)
        curr_seq = SequenceGame.count_sequences_on_board(game.board, player.team_id)
        for m in moves:
            hypo = make_hypothetical_board(game, m, player.team_id)
            if SequenceGame.count_sequences_on_board(hypo, player.team_id) > curr_seq:
                return m

        # 4. EXTEND/POSITIONAL SCORE
        best_move = None
        max_score = -9999
        
        for m in moves:
            c_idx, (r, c) = m
            card = player.hand[c_idx]
            hypo = make_hypothetical_board(game, m, player.team_id)
            
            score = 0
            
            if card.is_one_eyed_jack:
                # Removal value
                # Check neighbors of target (r,c) (which was opponents)
                # If it had many neighbors, high value.
                # Simple heuristic: Number of filled opponent neighbors
                ns = 0
                for dr in [-1,0,1]:
                    for dc in [-1,0,1]:
                        if dr==0 and dc==0: continue
                        nr, nc = r+dr, c+dc
                        if 0<=nr<10 and 0<=nc<10 and game.board.state[nr][nc] == opponent_team:
                            ns += 1
                score += (10 + ns * 5)
            else:
                # Placement value
                # 1. Chain length increase
                # Local line check around (r,c)
                max_len = 0
                for dr, dc in [(0,1), (1,0), (1,1), (1,-1)]:
                    # Count length of run passing through r,c
                    current_len = 1
                    # back
                    k = 1
                    while True:
                        nr, nc = r-k*dr, c-k*dc
                        if 0<=nr<10 and 0<=nc<10 and (hypo.state[nr][nc] == player.team_id or hypo.is_corner(nr,nc)):
                            current_len += 1
                            k += 1
                        else: break
                    # forward
                    k = 1
                    while True:
                        nr, nc = r+k*dr, c+k*dc
                        if 0<=nr<10 and 0<=nc<10 and (hypo.state[nr][nc] == player.team_id or hypo.is_corner(nr,nc)):
                            current_len += 1
                            k += 1
                        else: break
                    
                    if current_len > max_len:
                        max_len = current_len
                
                if max_len == 4: score += 50
                elif max_len == 3: score += 20
                elif max_len == 2: score += 5
                
                # Positional
                dist = abs(r-4.5) + abs(c-4.5)
                score += (10 - dist)
                
                # Double-eyed jack penalty (save for later?)
                if card.is_two_eyed_jack:
                    score -= 15 # Only use if high value (chain 3 or 4) matches > 15
            
            if score > max_score:
                max_score = score
                best_move = m
        
        return best_move if best_move else moves[0]
