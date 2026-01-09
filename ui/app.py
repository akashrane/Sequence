import streamlit as st
import pandas as pd
import time
import sys
import os

# Add root to logic path logic
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.game import SequenceGame, Card
from engine.ai import SequenceAI
from engine.simulation import SimulationRunner

st.set_page_config(page_title="Sequence Simulator", layout="wide")

if "game" not in st.session_state:
    st.session_state.game = None
if "selected_card_index" not in st.session_state:
    st.session_state.selected_card_index = None

def init_game(num_players, board_type, diff_ai):
    st.session_state.game = SequenceGame(num_players=num_players, board_type=board_type.lower())
    # Configure AI
    for p in st.session_state.game.players:
        if p.is_bot or p.id > 0: # Assume P0 is human for Play Mode
            p.strategy = diff_ai.lower() 
    st.session_state.selected_card_index = None

def render_board_play_mode(key_prefix="play"):
    game = st.session_state.game
    if not game: return

    # CSS for the board
    st.markdown("""
    <style>
    .board-row { display: flex; justify-content: center; }
    .board-cell { 
        width: 45px; height: 60px; 
        border: 1px solid #ccc; 
        margin: 2px;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: bold;
        position: relative;
    }
    .cell-P0 { background-color: #5555ff; color: white; }
    .cell-P1 { background-color: #ff5555; color: white; }
    .cell-P2 { background-color: #55ff55; color: black; }
    .cell-Locked { border: 3px solid gold !important; }
    .cell-Corner { background-color: #ccc; }
    .highlight { border: 2px solid yellow; cursor: pointer; }
    </style>
    """, unsafe_allow_html=True)

    # Determine highlights
    valid_targets = []
    if st.session_state.selected_card_index is not None:
        valid_targets = game.get_valid_moves(st.session_state.selected_card_index)

    # Render Grid using Columns
    # We can't use native HTML clicks easily without Custom Components.
    # We will use st.columns(10) loop.
    
    st.write(f"**Turn {game.current_turn_index}**: Player {game.current_player.id} (Team {game.current_player.team_id})")
    
    # We iterate rows
    for r in range(10):
        cols = st.columns(10)
        for c in range(10):
            with cols[c]:
                # Cell Content
                cell_card = game.board.grid[r][c]
                cell_state = game.board.state[r][c]
                locked = game.board.locked[r][c]
                is_corner = game.board.is_corner(r,c)
                
                label = "FREE" if is_corner else str(cell_card) if cell_card else ""
                
                # Dynamic Style logic handled by button usage?
                # Streamlit buttons don't support rich styling easily.
                # We use disabled=True for info, enabled for Valid Moves?
                
                is_valid_target = (r, c) in valid_targets
                
                # Determine display text and color hint
                display = label
                if cell_state is not None:
                    display = f"{label}\n(T{cell_state})"
                
                # Interaction
                key = f"{key_prefix}_cell_{r}_{c}_{game.current_turn_index}"
                
                if is_valid_target:
                    clicked = st.button("🎯", key=key, help=f"Place here on {label}")
                    if clicked:
                        success = game.play_move(st.session_state.selected_card_index, (r, c))
                        if success:
                            st.session_state.selected_card_index = None
                            st.rerun()
                else:
                    # Just show state
                    # Uses disabled button to look like a tile
                    status_emoji = ""
                    if cell_state == 0: status_emoji = "🔵"
                    elif cell_state == 1: status_emoji = "🔴"
                    elif cell_state == 2: status_emoji = "🟢"
                    
                    if locked: status_emoji += "🔒"
                    elif is_corner: status_emoji = "🆓"
                    
                    st.button(f"{status_emoji}\n{label}", key=key, disabled=True)

def render_hand():
    game = st.session_state.game
    if not game: return
    
    player = game.current_player
    # Only show controls if human (or debug mode)
    # Assume P0 is Human
    if player.id != 0:
        st.info(f"AI Player {player.id} is thinking...")
        if st.button("Step AI"):
            move = SequenceAI.get_move(game, player)
            if move:
                idx, target = move
                game.play_move(idx, target)
                st.rerun()
            else:
                # Dead card?
                dead = game.find_dead_card(player.id)
                if dead is not None:
                    game.replace_dead_card(dead)
                    st.warning("AI swapped dead card.")
                    st.rerun()
                else:
                    st.error("AI stuck.")
        return

    st.write("### Your Hand")
    cols = st.columns(len(player.hand))
    for i, card in enumerate(player.hand):
        with cols[i]:
            # Highlight chosen
            label = str(card)
            if card.is_two_eyed_jack: label += " (WILD)"
            if card.is_one_eyed_jack: label += " (RMV)"
            
            b_type = "primary" if i == st.session_state.selected_card_index else "secondary"
            if st.button(label, key=f"hand_{i}", type=b_type):
                st.session_state.selected_card_index = i
                st.rerun()
    
    # Dead card check
    dead_idx = game.find_dead_card(player.id)
    if dead_idx is not None:
        if st.button(f"Discard Dead Card: {player.hand[dead_idx]}"):
            game.replace_dead_card(dead_idx)
            st.session_state.selected_card_index = None
            st.rerun()

def tab_play():
    st.header("Play vs AI")
    
    with st.expander("Game Setup", expanded=True):
        col1, col2 = st.columns(2)
        p_count = col1.number_input("Players", 2, 8, 2)
        b_type = col2.selectbox("Board Type", ["Standard", "Random"])
        ai_diff = col1.selectbox("AI Difficulty", ["Smart", "Random"])
        if st.button("Start New Game"):
            init_game(p_count, b_type, ai_diff)
            st.rerun()

    if "game" in st.session_state and st.session_state.game:
        col_board, col_info = st.columns([3, 1])
        
        with col_board:
            render_board_play_mode(key_prefix="play")
            render_hand()
            
        with col_info:
            st.write("### Game Info")
            st.write(f"Cards Left: {len(st.session_state.game.deck.cards)}")
            if st.session_state.game.winner is not None:
                st.success(f"WINNER: Team {st.session_state.game.winner}")
                st.balloons()

def tab_simulation():
    st.header("Monte Carlo Simulation")
    
    col1, col2 = st.columns(2)
    n_games = col1.number_input("Number of Games", 10, 1000, 50)
    ai_p1 = col2.selectbox("P1 Strategy", ["Random", "Smart"])
    ai_p2 = col2.selectbox("P2 Strategy", ["Smart", "Random"])
    board_t = col1.selectbox("Sim Board", ["Standard", "Random"])
    
    if st.button("Run Simulation"):
        with st.spinner("Simulating..."):
            df = SimulationRunner.run_batch(n_games, board_t.lower(), ai_p1.lower(), ai_p2.lower())
            st.session_state.sim_results = df
            st.success("Done!")

    if "sim_results" in st.session_state:
        df = st.session_state.sim_results
        
        st.write("### Results Summary")
        win_counts = df['winner'].value_counts()
        st.bar_chart(win_counts)
        
        st.write(f"Avg Turns: {df['turns'].mean():.1f}")
        st.dataframe(df)

def main():
    tab1, tab2, tab3 = st.tabs(["Play Game", "AI Battle", "Monte Carlo"])
    
    with tab1:
        tab_play()
    
    with tab2:
        st.write("AI vs AI Watch Mode (Simplified)")
        if st.button("Initialize Bot Game"):
             st.session_state.game = SequenceGame(num_players=2, board_type="standard")
             st.session_state.game.players[0].strategy = "smart"
             st.session_state.game.players[1].strategy = "smart"
             st.rerun()
             
        if st.session_state.game:
            render_board_play_mode(key_prefix="ai")
            if st.button("Next Turn"):
                p = st.session_state.game.current_player
                move = SequenceAI.get_move(st.session_state.game, p)
                if move:
                    st.session_state.game.play_move(move[0], move[1])
                    st.rerun()
                
    with tab3:
        tab_simulation()

if __name__ == "__main__":
    main()
