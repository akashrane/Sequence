from typing import List, Tuple, Dict, Optional
from .models import Card, Deck, Player, BoardState, Rank, Suit
from .board import Board

class SequenceGame:
    def __init__(self, num_players: int = 2, board_type: str = "standard", teams: bool = True):
        self.num_players = num_players
        self.board = Board(layout_type=board_type)
        self.deck = Deck()
        self.players: List[Player] = []
        self.current_turn_index = 0
        self.log: List[dict] = []
        self.winner: Optional[int] = None # Team ID

        self.teams_mode = teams
        for i in range(num_players):
            team_id = i % 2 if teams else i
            self.players.append(Player(id=i, team_id=team_id, hand=[]))
        
        self.deal_cards()

    def deal_cards(self):
        if self.num_players == 2:
            hand_size = 7
        elif self.num_players <= 4:
            hand_size = 6
        elif self.num_players <= 6:
            hand_size = 5
        else:
            hand_size = 4
        
        for _ in range(hand_size):
            for p in self.players:
                card = self.deck.draw()
                if card:
                    p.hand.append(card)

    @property
    def current_player(self) -> Player:
        return self.players[self.current_turn_index]

    def get_valid_moves(self, card_index: int) -> List[Tuple[int, int]]:
        player = self.current_player
        if card_index >= len(player.hand):
            return []
            
        card = player.hand[card_index]
        moves = []
        
        if card.is_two_eyed_jack:
            for r in range(10):
                for c in range(10):
                    if not self.board.is_corner(r, c) and self.board.state[r][c] is None:
                        moves.append((r, c))
        elif card.is_one_eyed_jack:
            for r in range(10):
                for c in range(10):
                    curr_team = self.board.state[r][c]
                    if curr_team is not None and curr_team != player.team_id:
                        if not self.board.locked[r][c]:
                            moves.append((r, c))
        else:
            key = str(card)
            possible_locs = self.board.card_positions.get(key, [])
            for r, c in possible_locs:
                if self.board.state[r][c] is None:
                    moves.append((r, c))
        
        return moves
        
    def find_dead_card(self, player_idx: int) -> Optional[int]:
        player = self.players[player_idx]
        for i, card in enumerate(player.hand):
            if card.rank == Rank.JACK:
                continue
            
            key = str(card)
            locs = self.board.card_positions.get(key, [])
            if not locs:
                continue
                
            occupied_count = 0
            for r, c in locs:
                if self.board.state[r][c] is not None:
                    occupied_count += 1
            
            if occupied_count == len(locs):
                return i
        return None

    def replace_dead_card(self, card_index: int):
        player = self.current_player
        if 0 <= card_index < len(player.hand):
            old_card = player.hand.pop(card_index)
            new_card = self.deck.draw()
            if new_card:
                player.hand.append(new_card)
            self.log.append({
                "turn": self.current_turn_index,
                "player": player.id,
                "action": "dead_card",
                "card": str(old_card)
            })

    def play_move(self, card_index: int, target: Tuple[int, int]):
        player = self.current_player
        if not (0 <= card_index < len(player.hand)):
            return False
            
        card = player.hand[card_index]
        r, c = target
        
        valid = False
        action_type = "place"
        
        if card.is_two_eyed_jack:
            if self.board.state[r][c] is None and not self.board.is_corner(r,c):
                self.board.place_chip(r, c, player.team_id)
                valid = True
        elif card.is_one_eyed_jack:
            if self.board.state[r][c] is not None and \
               self.board.state[r][c] != player.team_id and \
               not self.board.locked[r][c]:
                self.board.remove_chip(r, c)
                valid = True
                action_type = "remove"
        else:
            target_card = self.board.grid[r][c]
            # Strict string matching or card equality
            if str(target_card) == str(card) and self.board.state[r][c] is None:
                self.board.place_chip(r, c, player.team_id)
                valid = True

        if valid:
            player.hand.pop(card_index)
            new_card = self.deck.draw()
            if new_card:
                player.hand.append(new_card)
            
            self.log.append({
                "player": player.id,
                "team": player.team_id,
                "card": str(card),
                "action": action_type,
                "target": target
            })
            
            self.check_sequences_and_lock(player.team_id)
            
            if self.check_win(player.team_id):
                self.winner = player.team_id
            
            self.current_turn_index = (self.current_turn_index + 1) % self.num_players
            return True
        return False

    def check_sequences_and_lock(self, team_id: int):
        # Identify NEW sequences and lock them
        # Just scan all sequences for this team
        
        rows, cols = 10, 10
        directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
        
        captured_groups = []
        
        for r in range(rows):
            for c in range(cols):
                for dr, dc in directions:
                    line = []
                    valid = True
                    for k in range(5):
                        nr, nc = r + k*dr, c + k*dc
                        if not (0 <= nr < rows and 0 <= nc < cols):
                            valid = False
                            break
                        
                        val = self.board.state[nr][nc]
                        if not (val == team_id or self.board.is_corner(nr, nc)):
                            valid = False
                            break
                        line.append((nr, nc))
                    
                    if valid:
                        captured_groups.append(line)
                        
        # Lock them
        for group in captured_groups:
            for rr, cc in group:
                if not self.board.is_corner(rr, cc):
                    self.board.locked[rr][cc] = True

    def check_win(self, team_id: int) -> bool:
        required = 2 if self.teams_mode and self.num_players % 2 == 0 else 1
        if self.num_players == 3: required = 1
        
        # Use static helper
        count = SequenceGame.count_sequences_on_board(self.board, team_id)
        return count >= required

    @staticmethod
    def count_sequences_on_board(board, team_id: int) -> int:
        rows = 10
        cols = 10
        total_seq = 0
        
        def scan_dir(dr, dc):
            c_seq = 0
            # Broad scan: iterate all valid start lines for this direction
            # This is slightly inefficient but safe
            # Map all cells to "lines"
            
            # Horizontal
            if dr == 0:
                for r in range(rows):
                    consecutive = 0
                    for c in range(cols):
                        val = board.state[r][c]
                        if val == team_id or board.is_corner(r, c):
                            consecutive += 1
                        else:
                            c_seq += (consecutive // 5)
                            consecutive = 0
                    c_seq += (consecutive // 5)
            # Vertical
            elif dc == 0:
                for c in range(cols):
                    consecutive = 0
                    for r in range(rows):
                        val = board.state[r][c]
                        if val == team_id or board.is_corner(r, c):
                            consecutive += 1
                        else:
                            c_seq += (consecutive // 5)
                            consecutive = 0
                    c_seq += (consecutive // 5)
            else:
                # Diagonal
                # Scan all diagonals
                # There are diagonals starting at (0,0)..(0,9) and (1,0)..(9,0)
                
                # Setup Starts
                starts = []
                # Top row
                for c in range(cols): starts.append((0, c))
                # Left col (exclude 0,0)
                for r in range(1, rows): starts.append((r, 0))
                # Right col for / diag
                for r in range(1, rows): starts.append((r, cols-1))
                
                # Filter useful starts based on dr, dc
                # For \ (1, 1): Start Top or Left
                # For / (1, -1): Start Top or Right
                
                valid_starts = []
                if dc == 1: # \
                    for c in range(cols): valid_starts.append((0, c))
                    for r in range(1, rows): valid_starts.append((r, 0))
                else: # /
                    for c in range(cols): valid_starts.append((0, c))
                    for r in range(1, rows): valid_starts.append((r, cols-1))
                
                for sr, sc in valid_starts:
                    consecutive = 0
                    r, c = sr, sc
                    while 0 <= r < rows and 0 <= c < cols:
                        val = board.state[r][c]
                        if val == team_id or board.is_corner(r, c):
                            consecutive += 1
                        else:
                            c_seq += (consecutive // 5)
                            consecutive = 0
                        r += dr
                        c += dc
                    c_seq += (consecutive // 5)
            return c_seq

        total_seq += scan_dir(0, 1) # H
        total_seq += scan_dir(1, 0) # V
        total_seq += scan_dir(1, 1) # \
        total_seq += scan_dir(1, -1) # /
        
        return total_seq
