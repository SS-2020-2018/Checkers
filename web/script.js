/* Browser implementation of the same 32-square checkers rules used by the Python game. */
const screens = {
  welcome: document.querySelector("#welcome-screen"),
  mode: document.querySelector("#mode-screen"),
  game: document.querySelector("#game-screen"),
};
const boardElement = document.querySelector("#board");
const statusMessage = document.querySelector("#status-message");
const turnText = document.querySelector("#turn-text");
const turnPiece = document.querySelector("#turn-piece");
const whiteCount = document.querySelector("#white-count");
const blackCount = document.querySelector("#black-count");
const modeLabel = document.querySelector("#mode-label");

const modeNames = {
  "human-human": "Human vs Human",
  "human-ai": "Human vs AI",
  "ai-ai": "AI vs AI",
};

let state;
let aiTimer;

function createInitialState(mode) {
  const pieces = [];
  for (let position = 0; position < 12; position += 1) pieces.push({ position, color: "B", king: false });
  for (let position = 20; position < 32; position += 1) pieces.push({ position, color: "W", king: false });
  const newState = {
    pieces,
    turn: "W",
    selected: null,
    validMoves: [],
    winner: null,
    drawReason: null,
    mode,
    chainPiece: null,
    quietMoves: 0,
    positionHistory: new Map(),
  };
  newState.positionHistory.set(positionKey(newState), 1);
  return newState;
}

function otherColor(color) {
  return color === "W" ? "B" : "W";
}

function coordinates(position) {
  const row = Math.floor(position / 4);
  const column = (position % 4) * 2 + (row % 2);
  return { row, column };
}

function positionAt(row, column) {
  if (row < 0 || row > 7 || column < 0 || column > 7 || (column - (row % 2) + 2) % 2 !== 0) return null;
  return row * 4 + Math.floor((column - (row % 2)) / 2);
}

function pieceAt(position) {
  return state.pieces.find((piece) => piece.position === position) || null;
}

function moveDirections(piece) {
  const directions = [];
  const { row, column } = coordinates(piece.position);
  if (piece.king || piece.color === "W") {
    directions.push([-1, -1], [-1, 1]);
  }
  if (piece.king || piece.color === "B") {
    directions.push([1, -1], [1, 1]);
  }
  return directions.map(([rowDelta, columnDelta]) => ({
    row: row + rowDelta,
    column: column + columnDelta,
  }));
}

function getPieceMoves(piece, includeSimple = true) {
  const moves = [];
  const current = coordinates(piece.position);
  for (const adjacent of moveDirections(piece)) {
    const adjacentPosition = positionAt(adjacent.row, adjacent.column);
    if (adjacentPosition === null) continue;
    const blockingPiece = pieceAt(adjacentPosition);
    if (!blockingPiece) {
      if (includeSimple) moves.push({ to: adjacentPosition, capture: null });
      continue;
    }
    if (blockingPiece.color === piece.color) continue;
    const landingRow = adjacent.row + (adjacent.row - current.row);
    const landingColumn = adjacent.column + (adjacent.column - current.column);
    const landingPosition = positionAt(landingRow, landingColumn);
    if (landingPosition !== null && !pieceAt(landingPosition)) {
      moves.push({ to: landingPosition, capture: adjacentPosition });
    }
  }
  const captures = moves.filter((move) => move.capture !== null);
  return captures.length ? captures : moves;
}

function legalMoves(color = state.turn) {
  const moves = [];
  state.pieces.forEach((piece, index) => {
    if (piece.color !== color) return;
    if (state.chainPiece !== null && piece.position !== state.chainPiece) return;
    getPieceMoves(piece).forEach((move) => moves.push({ index, ...move }));
  });
  const captures = moves.filter((move) => move.capture !== null);
  return captures.length ? captures : moves;
}

function canInteract() {
  return !state.winner && (state.mode !== "human-ai" || state.turn === "W") && state.mode !== "ai-ai";
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const position = positionAt(row, column);
      const square = document.createElement("button");
      square.type = "button";
      square.className = `square ${(position === null ? "light" : "dark")}`;
      square.setAttribute("role", "gridcell");
      if (position === null) {
        square.disabled = true;
      } else {
        square.dataset.position = position;
        if (state.selected === position) square.classList.add("selected");
        if (state.validMoves.some((move) => move.to === position)) square.classList.add("valid");
        const piece = pieceAt(position);
        if (piece) {
          const pieceElement = document.createElement("span");
          pieceElement.className = `piece ${piece.color === "W" ? "white-piece" : "black-piece"}${piece.king ? " king" : ""}`;
          square.append(pieceElement);
          square.setAttribute("aria-label", `${piece.color === "W" ? "White" : "Black"}${piece.king ? " king" : ""} piece`);
        } else {
          square.setAttribute("aria-label", `Empty square ${position}`);
        }
        square.addEventListener("click", () => handleSquareClick(position));
      }
      boardElement.append(square);
    }
  }
  updatePanel();
}

function updatePanel() {
  const whitePieces = state.pieces.filter((piece) => piece.color === "W").length;
  const blackPieces = state.pieces.filter((piece) => piece.color === "B").length;
  whiteCount.textContent = whitePieces;
  blackCount.textContent = blackPieces;
  turnText.textContent = state.winner === "DRAW"
    ? "It's a draw!"
    : state.winner
      ? `${state.winner === "W" ? "White" : "Black"} wins!`
      : `${state.turn === "W" ? "White" : "Black"}'s turn`;
  turnPiece.className = `mini-piece ${state.turn === "W" ? "white-piece" : "black-piece"}`;
  modeLabel.textContent = modeNames[state.mode];
  if (state.winner === "DRAW") {
    statusMessage.textContent = state.drawReason;
  } else if (state.winner) {
    statusMessage.textContent = "Great game! Start a new game to play again.";
  } else if (state.chainPiece !== null) {
    statusMessage.textContent = "Another capture is available with this piece.";
  } else if (state.mode === "ai-ai" || (state.mode === "human-ai" && state.turn === "B")) {
    statusMessage.textContent = "The computer is thinking...";
  } else {
    statusMessage.textContent = state.validMoves.length ? "Choose a highlighted destination." : "Select a piece to begin.";
  }
}

function handleSquareClick(position) {
  if (!canInteract()) return;
  const selectedMove = state.validMoves.find((move) => move.to === position);
  if (selectedMove) {
    performMove(selectedMove);
    return;
  }
  const piece = pieceAt(position);
  if (!piece || piece.color !== state.turn) return;
  const moves = legalMoves().filter((move) => move.index === state.pieces.indexOf(piece));
  if (!moves.length) return;
  state.selected = position;
  state.validMoves = moves;
  renderBoard();
}

function performMove(move) {
  const piece = state.pieces[move.index];
  const wasKing = piece.king;
  piece.position = move.to;
  if (move.capture !== null) state.pieces = state.pieces.filter((candidate) => candidate.position !== move.capture);
  const row = coordinates(piece.position).row;
  if (!piece.king && ((piece.color === "W" && row === 0) || (piece.color === "B" && row === 7))) piece.king = true;
  if (move.capture !== null || (!wasKing && piece.king)) state.quietMoves = 0;
  else state.quietMoves += 1;
  state.selected = null;
  state.validMoves = [];
  const nextCaptures = move.capture === null ? [] : getPieceMoves(piece).filter((candidate) => candidate.capture !== null);
  if (nextCaptures.length) {
    state.selected = piece.position;
    state.validMoves = nextCaptures;
    state.chainPiece = piece.position;
  } else {
    state.chainPiece = null;
    state.turn = otherColor(state.turn);
  }
  recordPosition();
  checkWinner();
  renderBoard();
  scheduleAiIfNeeded();
}

function checkWinner() {
  if (!state.pieces.some((piece) => piece.color === "W")) state.winner = "B";
  else if (!state.pieces.some((piece) => piece.color === "B")) state.winner = "W";
  else if (!legalMoves(state.turn).length) state.winner = otherColor(state.turn);
  else if (state.positionHistory.get(positionKey()) >= 3) {
    state.winner = "DRAW";
    state.drawReason = "The same position occurred three times.";
  } else if (state.quietMoves >= 80) {
    state.winner = "DRAW";
    state.drawReason = "Draw: 40 moves by each side without a capture or promotion.";
  }
}

function positionKey(gameState = state) {
  const pieces = gameState.pieces
    .map((piece) => `${piece.color}${piece.king ? "K" : "M"}${piece.position}`)
    .sort()
    .join(",");
  return `${gameState.turn}|${gameState.chainPiece ?? "-"}|${pieces}`;
}

function recordPosition() {
  const key = positionKey();
  state.positionHistory.set(key, (state.positionHistory.get(key) || 0) + 1);
}

function clonePosition() {
  return state.pieces.map((piece) => ({ ...piece }));
}

function aiMove() {
  const moves = legalMoves();
  if (!moves.length) {
    checkWinner();
    renderBoard();
    return;
  }
  let bestScore = -Infinity;
  let bestMoves = [];
  moves.forEach((move) => {
    const before = clonePosition();
    performMoveForSearch(move);
    const score = evaluateBoard() - Math.random() * 0.05;
    state.pieces = before;
    if (score > bestScore) { bestScore = score; bestMoves = [move]; }
    else if (score === bestScore) bestMoves.push(move);
  });
  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
  performMove(selectedMove);
}

function performMoveForSearch(move) {
  const piece = state.pieces[move.index];
  piece.position = move.to;
  if (move.capture !== null) state.pieces = state.pieces.filter((candidate) => candidate.position !== move.capture);
}

function evaluateBoard() {
  return state.pieces.reduce((score, piece) => score + (piece.color === state.turn ? 1 + (piece.king ? 0.5 : 0) : -1), 0);
}

function scheduleAiIfNeeded() {
  if (state.winner || (state.mode !== "ai-ai" && !(state.mode === "human-ai" && state.turn === "B"))) return;
  clearTimeout(aiTimer);
  aiTimer = setTimeout(aiMove, 550);
}

function startGame(mode) {
  clearTimeout(aiTimer);
  state = createInitialState(mode);
  screens.welcome.classList.add("is-hidden");
  screens.mode.classList.add("is-hidden");
  screens.game.classList.remove("is-hidden");
  renderBoard();
  scheduleAiIfNeeded();
}

document.querySelector("#lets-play-button").addEventListener("click", () => {
  screens.welcome.classList.add("is-hidden");
  screens.mode.classList.remove("is-hidden");
});
document.querySelector("#back-to-welcome").addEventListener("click", () => {
  screens.mode.classList.add("is-hidden");
  screens.welcome.classList.remove("is-hidden");
});
document.querySelectorAll(".mode-option").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.mode));
});
document.querySelector("#new-game-button").addEventListener("click", () => startGame(state.mode));
