# Checkers

**Checkers** is a two-player strategy game implemented in Python with
Pygame. The project also includes a browser version built with HTML, CSS, and
JavaScript.

The project was created by **Mesba & Safiul** as an object-oriented
programming and game-development project.

## Project objectives

- Build a playable checkers game using object-oriented Python.
- Separate game rules, board state, pieces, artificial intelligence, and GUI
  responsibilities.
- Implement mandatory captures, chained jumps, and king promotion.
- Provide three game modes for different types of players.
- Create a responsive web interface for playing the game in a browser.
- Practice unit testing and incremental feature development.

## Features

- Standard 8 x 8 checkers board with 32 playable dark squares.
- 12 black pieces and 12 white pieces at the start of every game.
- Diagonal movement.
- Mandatory capture rule.
- Capture of an opponent piece by jumping.
- Multiple captures in one turn.
- Automatic king promotion.
- Kings can move and capture in both directions.
- Winner detection when a player has no pieces or no legal moves.
- Python AI using minimax with alpha-beta pruning.
- Short Monte Carlo rollouts to break ties between AI moves.
- Human vs Human, Human vs AI, and AI vs AI modes.
- Browser interface with responsive layout, status panel, score counter, and
  highlighted legal destinations.
- Web draw detection through repeated-position and quiet-move rules.

## Game modes

### Human vs Human (`pvp`)

Two people play on the same computer. White moves first, followed by Black.

### Human vs AI (`cpu`)

The human controls White and the computer controls Black. The computer move
is triggered automatically after the human finishes a turn.

### AI vs AI (`ai`)

Two AI players play against one another automatically. This mode is useful for
observing the search algorithm and game rules without manual input.

## Checkers rules used in this project

1. White starts the game.
2. A normal piece moves one diagonal square forward.
3. A king can move diagonally forward or backward.
4. If a capture is available, the player must capture.
5. A piece captures by jumping over an opponent piece into an empty square.
6. If another capture is available after a jump, the same piece must continue
   capturing before the turn changes.
7. A piece becomes a king after reaching the opponent's back row.
8. A player wins when the opponent has no pieces or no legal moves.
9. In the web version, a draw is declared when the same position occurs three
   times or when 40 moves by each side occur without a capture or promotion.

## Python project architecture

| File | Responsibility |
| --- | --- |
| `checkers.py` | Application entry point, game mode selection, Pygame event loop, and screen updates. |
| `game_control.py` | Coordinates turns, user interaction, AI turns, move validation, chained captures, and winner detection. |
| `board.py` | Stores pieces, translates board positions, performs moves, removes captured pieces, and checks piece-based winners. |
| `piece.py` | Represents a piece and calculates normal moves and captures. |
| `ai.py` | Generates legal AI moves and evaluates moves with minimax, alpha-beta pruning, and Monte Carlo tie-breaking. |
| `board_gui.py` | Draws the board and pieces, detects clicked pieces, and displays legal move markers. |
| `held_piece.py` | Handles the piece image while a player drags a piece with the mouse. |
| `utils.py` | Converts between board positions, row/column coordinates, and screen coordinates. |
| `tests/` | Unit tests for board operations, piece movement, and AI decisions. |
| `images/` | Board, piece, king, and move-marker images used by the Pygame interface. |

## Python game flow

The Python application starts in `checkers.py`.

1. Pygame is initialized and a display window is created.
2. The selected command-line mode creates a `GameControl` instance.
3. `GameControl` creates the initial board with 12 pieces for each color.
4. The event loop receives mouse and timer events.
5. Human input is handled through `hold_piece()` and `release_piece()`.
6. The selected move is validated against legal move markers.
7. The board performs the move, removes captured pieces, and promotes kings.
8. The controller keeps the same turn when another capture is mandatory.
9. AI turns call `AI.get_move()` and update the board automatically.
10. The game stops accepting moves when a winner is detected.

## AI design

The Python AI follows these steps:

1. Generate all legal moves for its color.
2. If any capture exists, discard all non-capturing moves.
3. Simulate candidate moves on copied board states.
4. Use minimax search to evaluate future positions.
5. Use alpha-beta pruning to skip branches that cannot improve the result.
6. Use short random rollouts to choose between equally scored moves.
7. Execute the selected move.

The evaluation function considers:

- Whether the AI has won or lost.
- The number of pieces remaining for each player.
- The number of kings through the simulated board position.

The browser AI is intentionally lightweight so that it can run directly in
the browser without a server or external library. It uses legal move
generation and a material-based heuristic. It also supports the same capture,
promotion, and winner rules as the Python game.

## Installation and setup

### Requirements

- Python 3.13 or a compatible Python version.
- Pygame.
- Pytest for running the test suite.
- A modern web browser for the web version.

### Windows PowerShell

From the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If PowerShell blocks script activation, run the game directly through the
virtual-environment interpreter:

```powershell
.\.venv\Scripts\python.exe checkers.py pvp
```

### macOS or Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Running the Python game

Use one of the supported modes:

```bash
python checkers.py pvp
python checkers.py cpu
python checkers.py ai
```

| Command | Result |
| --- | --- |
| `python checkers.py pvp` | Human vs Human |
| `python checkers.py cpu` | Human vs AI |
| `python checkers.py ai` | AI vs AI |

Close the Pygame window to exit the game.

## Running the web version

The browser version is located in [`web/`](web/).

### Recommended method

Start a local web server from the project directory:

```bash
python -m http.server 8765
```

Open the following address in a browser:

```text
http://127.0.0.1:8765/web/index.html
```

The web interface contains:

- Welcome page.
- Contributor credit.
- Game mode selection.
- Responsive 8 x 8 board.
- Legal move highlighting.
- Turn and winner status.
- Piece counters.
- New game button.
- Rules panel.
- AI vs AI playback.

## Testing

Run the Python unit tests from the project root:

```bash
python -m pytest -q
```

The tests cover:

- Piece position, color, and king status.
- Normal movement.
- Board boundaries.
- Captures.
- Forced captures.
- King movement.
- Board coordinate conversion.
- Piece lookup and winner detection.
- Minimax values and AI move selection.

## Presentation summary

### Problem statement

Traditional board games provide useful examples for learning software design,
but a game must correctly coordinate state, rules, user input, graphics, and
automated players. This project solves that problem by implementing checkers
with separate classes for each responsibility.

### Proposed solution

The project models each piece and the board as objects. A controller connects
the board rules to the Pygame interface and AI. Legal moves are calculated
from the current board state, which allows the same rules to be used for
human interaction and computer decisions.

### Technologies used

- Python
- Pygame
- HTML
- CSS
- JavaScript
- Pytest
- Git and GitHub

### Learning outcomes

- Object-oriented design.
- Event-driven programming.
- Game-state management.
- Search algorithms and heuristics.
- Alpha-beta pruning.
- Unit testing.
- Responsive interface design.
- Separation of presentation and game logic.

## Possible future improvements

- Add a difficulty selector for the AI.
- Improve the browser AI with full minimax search.
- Add move history and undo support.
- Add sound effects and animations.
- Add online multiplayer.
- Add player name input and match statistics.
- Add automated browser tests.
- Improve draw rules to match a selected official checkers variant.

## Contributors

**Mesba & Safiul**
