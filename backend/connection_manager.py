from typing import Dict, List, Optional
import random
import string
import json
from fastapi import WebSocket

from engine.game import SequenceGame

class GameRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.game = SequenceGame(num_players=2) 
        self.slots: Dict[int, Optional[WebSocket]] = {0: None, 1: None}
        self.host_ws: Optional[WebSocket] = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        
        # Find Empty Slot
        player_id = -1
        for i in [0, 1]:
            if self.slots[i] is None:
                player_id = i
                self.slots[i] = websocket
                break
        
        if player_id == -1:
            await websocket.close(code=4000, reason="Room Full")
            return
            
        if not self.host_ws:
            self.host_ws = websocket

        # Send Welcome
        await websocket.send_json({
            "type": "WELCOME",
            "playerId": player_id,
            "roomCode": self.room_id
        })
        
        # Broadcast connection count
        count = sum(1 for s in self.slots.values() if s is not None)
        await self.broadcast({
            "type": "PLAYER_COUNT",
            "count": count
        })

    def disconnect(self, websocket: WebSocket):
        for pid, ws in self.slots.items():
            if ws == websocket:
                self.slots[pid] = None
                if websocket == self.host_ws:
                    self.host_ws = None
                break
                
    async def broadcast(self, message: dict):
        # Broadcast to all occupied slots
        for ws in self.slots.values():
            if ws is not None:
                try:
                    await ws.send_json(message)
                except:
                    pass # Disconnect handled in receive loop usually

class ConnectionManager:
    def __init__(self):
        # Map room_code -> GameRoom
        self.rooms: Dict[str, GameRoom] = {}

    def create_room(self) -> str:
        """Creates a new room with a random 4-letter code."""
        code = self._generate_code()
        while code in self.rooms:
            code = self._generate_code()
        
        self.rooms[code] = GameRoom(code)
        return code

    def get_room(self, room_code: str) -> Optional[GameRoom]:
        return self.rooms.get(room_code)

    def _generate_code(self, length=4) -> str:
        return ''.join(random.choices(string.ascii_uppercase, k=length))

# Global instance
manager = ConnectionManager()
