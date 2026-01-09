from typing import List, Optional, Tuple, Dict
import random
from .models import Card, Rank, Suit, BoardState

class Board:
    def __init__(self, layout_type: str = "standard"):
        self.rows = 10
        self.cols = 10
        self.grid: List[List[Optional[Card]]] = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        self.state: List[List[Optional[int]]] = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        self.locked: List[List[bool]] = [[False for _ in range(self.cols)] for _ in range(self.rows)]
        self.card_positions: Dict[str, List[Tuple[int, int]]] = {}

        if layout_type == "random":
            self._generate_random_layout()
        else:
            self._generate_standard_layout()

    def is_corner(self, r: int, c: int) -> bool:
        return (r == 0 or r == self.rows - 1) and (c == 0 or c == self.cols - 1)

    def _register_card(self, r: int, c: int, card: Optional[Card]):
        self.grid[r][c] = card
        if card:
            # We use repr() or str() for the key
            key = str(card)
            if key not in self.card_positions:
                self.card_positions[key] = []
            self.card_positions[key].append((r, c))

    def _generate_standard_layout(self):
        # Create deck order for spiral: Spades, Diamonds, Clubs, Hearts (Standard-ish)
        cards = []
        for suit in [Suit.SPADES, Suit.DIAMONDS, Suit.CLUBS, Suit.HEARTS]:
            for rank in [Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, 
                         Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, 
                         Rank.QUEEN, Rank.KING, Rank.ACE]: 
                 cards.append(Card(rank, suit))
        
        full_deck = cards * 2
        
        # Spiral Helper
        # Directions: Right, Down, Left, Up
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        direction_idx = 0
        
        # We fill the 100 squares by walking the spiral
        # Mark visited
        visited = [[False]*10 for _ in range(10)]
        
        r, c = 0, 0
        card_idx = 0
        
        for _ in range(100):
            visited[r][c] = True
            
            # If not corner, place card
            if not self.is_corner(r, c):
                if card_idx < len(full_deck):
                    self._register_card(r, c, full_deck[card_idx])
                    card_idx += 1
            else:
                self.grid[r][c] = None # Explicitly None for corners relative to cards
            
            # Next step
            vr = r + directions[direction_idx][0]
            vc = c + directions[direction_idx][1]
            
            if 0 <= vr < 10 and 0 <= vc < 10 and not visited[vr][vc]:
                r, c = vr, vc
            else:
                # Turn
                direction_idx = (direction_idx + 1) % 4
                r += directions[direction_idx][0]
                c += directions[direction_idx][1]

    def _generate_random_layout(self):
        deck_cards = []
        for suit in Suit:
            for rank in Rank:
                if rank == Rank.JACK:
                    continue
                deck_cards.append(Card(rank, suit))
                deck_cards.append(Card(rank, suit))
        
        random.shuffle(deck_cards)
        
        # Reset
        self.grid = [[None]*10 for _ in range(10)]
        self.card_positions = {}
        
        card_idx = 0
        for r in range(10):
            for c in range(10):
                if self.is_corner(r, c):
                    continue
                
                if card_idx < len(deck_cards):
                    self._register_card(r, c, deck_cards[card_idx])
                    card_idx += 1

    def place_chip(self, r: int, c: int, team_id: int):
        self.state[r][c] = team_id

    def remove_chip(self, r: int, c: int):
        self.state[r][c] = None
