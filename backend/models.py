from pydantic import BaseModel
from typing import List, Optional, Dict, Union
from enum import Enum

class ActionType(str, Enum):
    PLACE = "PLACE"
    TWO_EYED = "TWO_EYED"
    ONE_EYED = "ONE_EYED"
    NONE = "NONE"

class CardModel(BaseModel):
    rank: str
    suit: str
    label: str

class BoardCell(BaseModel):
    r: int
    c: int
    label: Optional[str] = None
    card: Optional[CardModel] = None
    chipTeam: Optional[int] = None
    isLocked: bool = False
    isCorner: bool = False
    highlight: bool = False # For UI convenience

class PlayerState(BaseModel):
    id: int
    teamId: int
    hand: List[str] # Card labels e.g., "J♠"
    isBot: bool

class GameState(BaseModel):
    gameId: str
    board: List[List[BoardCell]]
    players: List[PlayerState]
    currentTurnIndex: int
    currentPlayerId: int
    currentTeamId: int
    winnerTeam: Optional[int] = None
    log: List[Dict]
    cardsLeft: int

class NewGameRequest(BaseModel):
    nPlayers: int = 2
    teams: Optional[List[int]] = None # If None, auto assign 0, 1, 0, 1...
    boardType: str = "standard"
    seed: Optional[int] = None
    aiLevel: str = "smart" # simple, smart

class MoveRequest(BaseModel):
    handIndex: int
    pos: Dict[str, int] # {r: 0, c: 0}

class LegalMoveResponse(BaseModel):
    actionType: ActionType
    positions: List[Dict[str, int]] # [{r:0, c:0}, ...]
    reason: Optional[str] = None
