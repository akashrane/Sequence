from dataclasses import dataclass
from enum import Enum
from typing import List, Tuple, Optional, Dict, Set
import random

class Suit(str, Enum):
    HEARTS = '♥'
    DIAMONDS = '♦'
    CLUBS = '♣'
    SPADES = '♠'

class Rank(str, Enum):
    TWO = '2'
    THREE = '3'
    FOUR = '4'
    FIVE = '5'
    SIX = '6'
    SEVEN = '7'
    EIGHT = '8'
    NINE = '9'
    TEN = '10'
    JACK = 'J'
    QUEEN = 'Q'
    KING = 'K'
    ACE = 'A'

@dataclass(frozen=True)
class Card:
    rank: Rank
    suit: Suit
    
    def __repr__(self):
        return f"{self.rank.value}{self.suit.value}"

    @property
    def is_two_eyed_jack(self):
        return self.rank == Rank.JACK and self.suit in [Suit.DIAMONDS, Suit.CLUBS]

    @property
    def is_one_eyed_jack(self):
        return self.rank == Rank.JACK and self.suit in [Suit.HEARTS, Suit.SPADES]

class Deck:
    def __init__(self):
        self.cards: List[Card] = []
        self._initialize_deck()
    
    def _initialize_deck(self):
        # Two standard decks
        for _ in range(2):
            for suit in Suit:
                for rank in Rank:
                    self.cards.append(Card(rank, suit))
        random.shuffle(self.cards)

    def draw(self) -> Optional[Card]:
        return self.cards.pop() if self.cards else None

    def is_empty(self) -> bool:
        return len(self.cards) == 0

@dataclass
class Player:
    id: int
    team_id: int
    hand: List[Card]
    is_bot: bool = False
    strategy: str = "simple"

class BoardState(Enum):
    EMPTY = 0
    OCCUPIED_P1 = 1 # We might trace team ID instead
    OCCUPIED_P2 = 2 # Actually we store Team ID. -1 for empty? or None.
    LOCKED = 3 # Special state? Or just flag.

# We'll use Team int IDs on the board. 
# 0 = Empty/None (Actually use None for empty)
# Free/Corner spaces are conceptually filled by ALL teams for sequence checking.
