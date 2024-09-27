// Sound effect objects
const moveSound = new Audio('sounds/move.mp3'); // Sound for player move
const winSound = new Audio('sounds/win.mp3');   // Sound for winning
const drawSound = new Audio('sounds/draw.mp3'); // Sound for draw

// Variables for game state
const board = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const resetButton = document.getElementById("reset");
const modal = document.getElementById("gameModeModal");
const levelModal = document.getElementById("levelModal"); // Popup for difficulty levels
const winnerModal = document.getElementById("winnerModal");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const computerPlayerBtn = document.getElementById("computerPlayerBtn");
const newGameBtn = document.getElementById("newGameBtn");
const winnerMessage = document.getElementById("winnerMessage");
const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");
let currentPlayer = "X";
let boardState = Array(9).fill(null);
let isBotPlayer = false;
let botLevel = "hard"; // Default bot level
let startingPlayer = "X"; // To switch starting player after each game

// Check for winner combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Event listeners
cells.forEach(cell => cell.addEventListener("click", handleClick));
resetButton.addEventListener("click", resetGame);
twoPlayerBtn.addEventListener("click", () => startGame(false));
computerPlayerBtn.addEventListener("click", () => showLevelModal()); // Show level modal
newGameBtn.addEventListener("click", resetGame);
easyBtn.addEventListener("click", () => startGameWithBotLevel("easy"));
mediumBtn.addEventListener("click", () => startGameWithBotLevel("medium"));
hardBtn.addEventListener("click", () => startGameWithBotLevel("hard"));

// Show game mode selection popup when page loads
window.onload = () => {
    modal.style.display = "flex";
};

// Show bot difficulty level selection popup
function showLevelModal() {
    modal.style.display = "none";
    levelModal.style.display = "flex";
}

// Start game with selected bot level
function startGameWithBotLevel(level) {
    botLevel = level;
    isBotPlayer = true;
    levelModal.style.display = "none";
    document.querySelector(".container").style.display = "block";
    currentPlayer = startingPlayer; // Set the starting player for each game
    if (startingPlayer === "O" && isBotPlayer) {
        // If bot starts first, make a move immediately
        setTimeout(botMove, 500);
    }
}

// Start game based on mode selected
function startGame(botMode) {
    isBotPlayer = botMode;
    modal.style.display = "none";
    document.querySelector(".container").style.display = "block";
    currentPlayer = startingPlayer; // Set the starting player for each game
    if (startingPlayer === "O" && isBotPlayer) {
        // If bot starts first, make a move immediately
        setTimeout(botMove, 500);
    }
}

function handleClick(e) {
    const index = e.target.dataset.index;

    // Ensure the clicked cell is empty and it's the correct player's turn
    if (!boardState[index] && (currentPlayer === "X" || currentPlayer === "O")) {
        makeMove(index, currentPlayer);
        playSound(moveSound); // Play sound when a move is made

        // Check for winner or if the board is full
        if (!checkWinner() && !isBoardFull()) {
            currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch players

            // If it's the bot's turn, let the bot make a move
            if (currentPlayer === "O" && isBotPlayer) {
                setTimeout(botMove, 500); // Bot takes its turn after a delay
            }
        }
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    cells[index].style.pointerEvents = "none";
}

function checkWinner() {
    let winner = null;

    winningCombinations.forEach(combination => {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            winner = boardState[a];
            highlightWinningCells(combination);
            triggerConfetti();
        }
    });

    if (winner) {
        setTimeout(() => showWinnerPopup(`${winner} wins!`), 100);
        playSound(winSound); // Play win sound when there is a winner
        disableBoard();
        switchStartingPlayer();
        return true;
    }

    if (isBoardFull()) {
        setTimeout(() => showWinnerPopup("It's a draw!"), 100);
        playSound(drawSound); // Play draw sound when the game is a draw
        switchStartingPlayer();
        return true;
    }

    return false;
}

function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].style.backgroundColor = "#3ae374";
        cells[index].classList.add("winner"); // Adds a winning animation class
    });
}

function isBoardFull() {
    return boardState.every(cell => cell);
}

function disableBoard() {
    cells.forEach(cell => cell.style.pointerEvents = "none");
}

function resetGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.textContent = "";
        cell.style.pointerEvents = "auto";
        cell.style.backgroundColor = "#2c2f36";
        cell.classList.remove("x", "o", "winner");
    });
    stopConfetti();
    document.querySelector(".container").style.display = "none";
    winnerModal.style.display = "none";
    modal.style.display = "flex"; // Show game mode popup on reset
}

// Bot makes a move based on the selected difficulty level
function botMove() {
    switch (botLevel) {
        case "easy":
            botMoveEasy();
            break;
        case "medium":
            botMoveMedium();
            break;
        case "hard":
            botMoveHard();
            break;
    }
}

// Easy bot: Makes random moves
function botMoveEasy() {
    let availableMoves = boardState.map((val, index) => (val === null ? index : null)).filter(val => val !== null);
    let move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    makeMove(move, "O");
    if (!checkWinner()) {
        currentPlayer = "X";
    }
}

// Medium bot: Mix of random and strategic moves
function botMoveMedium() {
    let move = null;

    // Try to win if possible
    move = findBestMove("O");
    if (move === null) {
        // Block opponent from winning
        move = findBestMove("X");
    }
    if (move === null) {
        // Random move as fallback
        botMoveEasy();
        return;
    }

    makeMove(move, "O");
    if (!checkWinner()) {
        currentPlayer = "X";
    }
}

// Hard bot: Uses Minimax algorithm
function botMoveHard() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boardState.length; i++) {
        if (!boardState[i]) {
            boardState[i] = "O";
            let score = minimax(boardState, 0, false);
            boardState[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    makeMove(move, "O");
    if (!checkWinner()) {
        currentPlayer = "X";
    }
}

// Find the best move to block or win
function findBestMove(player) {
    for (let [a, b, c] of winningCombinations) {
        if (boardState[a] === player && boardState[b] === player && boardState[c] === null) return c;
        if (boardState[a] === player && boardState[c] === player && boardState[b] === null) return b;
        if (boardState[b] === player && boardState[c] === player && boardState[a] === null) return a;
    }
    return null;
}

function minimax(board, depth, isMaximizing) {
    let scores = { X: -1, O: 1, tie: 0 };
    let result = getWinner(board);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function getWinner(board) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes(null) ? null : "tie";
}

// Play sound effect
function playSound(sound) {
    sound.currentTime = 0; // Rewind the sound to the beginning
    sound.play();
}

// Confetti effect when winning
function triggerConfetti() {
    const confettiElement = document.getElementById("confetti");
    confettiElement.innerHTML = '<canvas id="confettiCanvas"></canvas>';
    const confettiSettings = { target: 'confettiCanvas', max: 150, clock: 25, rotate: true };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}

function stopConfetti() {
    const confettiElement = document.getElementById("confetti");
    confettiElement.innerHTML = '';
}

// Show winning popup
function showWinnerPopup(message) {
    winnerMessage.textContent = message;
    winnerModal.style.display = "flex";
}

// Switch starting player for the next game
function switchStartingPlayer() {
    startingPlayer = startingPlayer === "X" ? "O" : "X";
}


