import axios from 'axios';

const API_Base = 'http://localhost:8000/api';

export interface CardModel {
    rank: string;
    suit: string;
    label: string;
}

export interface BoardCell {
    r: number;
    c: number;
    label: string;
    card: CardModel | null;
    chipTeam: number | null;
    isLocked: boolean;
    isCorner: boolean;
}

export interface PlayerState {
    id: number;
    teamId: number;
    hand: string[];
    isBot: boolean;
}

export interface GameState {
    gameId: string;
    board: BoardCell[][];
    players: PlayerState[];
    currentTurnIndex: number;
    currentPlayerId: number;
    currentTeamId: number;
    winnerTeam: number | null;
    log: any[];
    cardsLeft: number;
}

export interface LegalMoveResponse {
    actionType: "PLACE" | "TWO_EYED" | "ONE_EYED" | "NONE";
    positions: { r: number, c: number }[];
    reason?: string;
}

export const api = {
    newGame: async (nPlayers: number = 2, boardType: string = 'standard', seed?: number, aiLevel: string = 'smart') => {
        const res = await axios.post<GameState>(`${API_Base}/game/new`, { nPlayers, boardType, seed, aiLevel });
        return res.data;
    },
    getState: async (gameId: string) => {
        const res = await axios.get<GameState>(`${API_Base}/game/${gameId}/state`);
        return res.data;
    },
    getLegalMoves: async (gameId: string, handIndex: number) => {
        const res = await axios.get<LegalMoveResponse>(`${API_Base}/game/${gameId}/legal-moves?handIndex=${handIndex}`);
        return res.data;
    },
    playMove: async (gameId: string, handIndex: number, r: number, c: number) => {
        const res = await axios.post<GameState>(`${API_Base}/game/${gameId}/move`, { handIndex, pos: { r, c } });
        return res.data;
    },
    replaceDeadCard: async (gameId: string, handIndex: number) => {
        const res = await axios.post<GameState>(`${API_Base}/game/${gameId}/replace-dead`, { handIndex, pos: { r: 0, c: 0 } });
        return res.data;
    },
    aiStep: async (gameId: string, steps: number = 1) => {
        const res = await axios.post<GameState>(`${API_Base}/game/${gameId}/ai-step`, { steps });
        return res.data;
    },
    simulate: async (trials: number) => {
        const res = await axios.post(`${API_Base}/simulate/monte-carlo`, { trials, boardType: "standard", aiLevel: "smart" });
        return res.data;
    },
    // Multiplayer
    createRoom: async () => {
        const res = await axios.post<{ roomCode: string }>(`${API_Base}/rooms/create`);
        return res.data;
    }
};
