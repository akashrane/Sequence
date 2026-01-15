from typing import Dict
from engine.game import SequenceGame

# In-memory storage for game instances
# Key: Game ID (UUID string)
# Value: SequenceGame object
games: Dict[str, SequenceGame] = {}
