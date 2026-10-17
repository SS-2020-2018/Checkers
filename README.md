# Checkers in Python

## About

From [Wikipedia](https://en.wikipedia.org/wiki/Draughts):

> Draughts or checkers is a group of strategy board games for two players which involve diagonal moves of uniform game pieces and mandatory captures by jumping over opponent pieces.

This was made using Python and the pygame module with the goal of studying OOP.

## Installation and usage

1. Clone the project with `git clone https://github.com/lucaskenji/python-checkers`.
2. Create and activate a virtual environment:
   - Windows PowerShell: `python -m venv .venv`, then `.venv\Scripts\Activate.ps1`
   - macOS/Linux: `python3 -m venv .venv`, then `source .venv/bin/activate`
3. Install the dependencies with `python -m pip install -r requirements.txt`.
4. Run `python checkers.py <gamemode>`. Gamemode can be "cpu" for singleplayer, "pvp" for local multiplayer, or "ai" to watch two computer players compete.
5. Optionally run `pytest` on the tests folder to run unit tests.

## Example

![Screenshot of the game](https://github.com/lucaskenji/python-checkers/blob/master/preview/screenshot.png)

## Singleplayer

The computer player uses minimax with alpha-beta pruning and bounded Monte Carlo rollouts to choose moves. The `ai` mode uses the same search independently for both colors.

In a nutshell, it works by simulating every possible outcome from the current board and assuming each player will make the "best" move.
This is a rather simple algorithm, which means the computer will not play using any strategies such as baiting the opponent to jump one of its pieces.
# Checkers
