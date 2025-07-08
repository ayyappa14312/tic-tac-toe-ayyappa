// Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameMode = 'twoPlayer'; // 'twoPlayer' or 'computer'
        this.difficulty = 'medium';
        this.isGameOver = false;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false;
        this.boardFlipped = false;
        
        this.initializeElements();
        this.bindEvents();
        this.showGameModeModal();
    }

    initializeBoard() {
        // Initialize empty 8x8 board
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up initial piece positions
        const initialSetup = {
            0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            1: ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            6: ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (initialSetup[row]) {
                    const piece = initialSetup[row][col];
                    const color = row < 2 ? 'black' : 'white';
                    board[row][col] = { piece, color, hasMoved: false };
                }
            }
        }
        
        return board;
    }

    initializeElements() {
        this.gameContainer = document.getElementById('gameContainer');
        this.chessBoard = document.getElementById('chessBoard');
        this.movesContainer = document.getElementById('movesContainer');
        this.capturedWhite = document.getElementById('capturedWhite');
        this.capturedBlack = document.getElementById('capturedBlack');
        this.whiteTimer = document.getElementById('whiteTimer');
        this.blackTimer = document.getElementById('blackTimer');
        
        this.createBoard();
        this.updateDisplay();
    }

    createBoard() {
        this.chessBoard.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                this.chessBoard.appendChild(square);
            }
        }
    }

    bindEvents() {
        // Modal events
        document.getElementById('twoPlayerBtn').addEventListener('click', () => this.startGame('twoPlayer'));
        document.getElementById('computerPlayerBtn').addEventListener('click', () => this.showDifficultyModal());
        document.getElementById('easyBtn').addEventListener('click', () => this.startGame('computer', 'easy'));
        document.getElementById('mediumBtn').addEventListener('click', () => this.startGame('computer', 'medium'));
        document.getElementById('hardBtn').addEventListener('click', () => this.startGame('computer', 'hard'));
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('rematchBtn').addEventListener('click', () => this.rematch());
        
        // Control buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('flipBtn').addEventListener('click', () => this.flipBoard());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    showGameModeModal() {
        document.getElementById('gameModeModal').style.display = 'flex';
    }

    showDifficultyModal() {
        document.getElementById('gameModeModal').style.display = 'none';
        document.getElementById('difficultyModal').style.display = 'flex';
    }

    startGame(mode, difficulty = 'medium') {
        this.gameMode = mode;
        this.difficulty = difficulty;
        document.getElementById('gameModeModal').style.display = 'none';
        document.getElementById('difficultyModal').style.display = 'none';
        this.gameContainer.classList.add('active');
        
        if (mode === 'computer' && this.currentPlayer === 'black') {
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    handleSquareClick(event) {
        if (this.isGameOver) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const square = this.board[row][col];
        
        // Clear previous highlights
        this.clearHighlights();
        
        // If a piece is already selected
        if (this.selectedPiece) {
            const selectedRow = this.selectedPiece.row;
            const selectedCol = this.selectedPiece.col;
            
            // Check if clicking on a valid move
            const isValidMove = this.validMoves.some(move => 
                move.row === row && move.col === col
            );
            
            if (isValidMove) {
                this.makeMove(selectedRow, selectedCol, row, col);
                this.selectedPiece = null;
                this.validMoves = [];
                
                // Make computer move if in computer mode
                if (this.gameMode === 'computer' && !this.isGameOver && this.currentPlayer === 'black') {
                    setTimeout(() => this.makeComputerMove(), 500);
                }
            } else {
                // Select new piece if clicking on own piece
                if (square && square.color === this.currentPlayer) {
                    this.selectPiece(row, col);
                } else {
                    this.selectedPiece = null;
                    this.validMoves = [];
                }
            }
        } else {
            // Select piece if clicking on own piece
            if (square && square.color === this.currentPlayer) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        this.highlightSquare(row, col, 'selected');
        this.highlightValidMoves();
    }

    clearHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
    }

    highlightSquare(row, col, type) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add(type);
        }
    }

    highlightValidMoves() {
        this.validMoves.forEach(move => {
            const square = this.board[move.row][move.col];
            const type = square ? 'capture-move' : 'valid-move';
            this.highlightSquare(move.row, move.col, type);
        });
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Handle capture
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece.piece);
            this.playSound('capture');
        } else {
            this.playSound('move');
        }
        
        // Update piece position
        this.board[toRow][toCol] = {
            ...piece,
            hasMoved: true
        };
        this.board[fromRow][fromCol] = null;
        
        // Handle special moves
        this.handleSpecialMoves(fromRow, fromCol, toRow, toCol);
        
        // Update move history
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece);
        this.addMoveToHistory(moveNotation);
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check game state
        this.checkGameState();
        
        // Update display
        this.updateDisplay();
    }

    handleSpecialMoves(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[toRow][toCol];
        
        // En passant
        if (piece.piece === '♙' || piece.piece === '♟') {
            if (Math.abs(fromRow - toRow) === 2) {
                piece.enPassantVulnerable = true;
            }
        }
        
        // Pawn promotion
        if ((piece.piece === '♙' && toRow === 0) || (piece.piece === '♟' && toRow === 7)) {
            this.promotePawn(toRow, toCol);
        }
        
        // Castling
        if (piece.piece === '♔' || piece.piece === '♚') {
            if (Math.abs(fromCol - toCol) === 2) {
                this.handleCastling(fromRow, fromCol, toRow, toCol);
            }
        }
    }

    promotePawn(row, col) {
        // For simplicity, always promote to queen
        const color = this.board[row][col].color;
        this.board[row][col].piece = color === 'white' ? '♕' : '♛';
    }

    handleCastling(fromRow, fromCol, toRow, toCol) {
        const isKingside = toCol > fromCol;
        const rookCol = isKingside ? 7 : 0;
        const newRookCol = isKingside ? toCol - 1 : toCol + 1;
        
        // Move rook
        this.board[fromRow][newRookCol] = this.board[fromRow][rookCol];
        this.board[fromRow][rookCol] = null;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const pieceType = piece.piece;
        
        switch (pieceType) {
            case '♙': // White pawn
                moves.push(...this.getPawnMoves(row, col, 'white'));
                break;
            case '♟': // Black pawn
                moves.push(...this.getPawnMoves(row, col, 'black'));
                break;
            case '♖': case '♜': // Rook
                moves.push(...this.getRookMoves(row, col));
                break;
            case '♘': case '♞': // Knight
                moves.push(...this.getKnightMoves(row, col));
                break;
            case '♗': case '♝': // Bishop
                moves.push(...this.getBishopMoves(row, col));
                break;
            case '♕': case '♛': // Queen
                moves.push(...this.getQueenMoves(row, col));
                break;
            case '♔': case '♚': // King
                moves.push(...this.getKingMoves(row, col));
                break;
        }
        
        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        const forwardRow = row + direction;
        if (forwardRow >= 0 && forwardRow < 8 && !this.board[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[forwardRow + direction][col]) {
                moves.push({ row: forwardRow + direction, col });
            }
        }
        
        // Diagonal captures
        const captureCols = [col - 1, col + 1];
        captureCols.forEach(captureCol => {
            if (captureCol >= 0 && captureCol < 8 && forwardRow >= 0 && forwardRow < 8) {
                const targetSquare = this.board[forwardRow][captureCol];
                if (targetSquare && targetSquare.color !== color) {
                    moves.push({ row: forwardRow, col: captureCol });
                }
            }
        });
        
        return moves;
    }

    getRookMoves(row, col) {
        return this.getSlidingMoves(row, col, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetSquare = this.board[newRow][newCol];
                if (!targetSquare || targetSquare.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getBishopMoves(row, col) {
        return this.getSlidingMoves(row, col, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getQueenMoves(row, col) {
        return this.getSlidingMoves(row, col, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetSquare = this.board[newRow][newCol];
                if (!targetSquare || targetSquare.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        // Add castling moves
        moves.push(...this.getCastlingMoves(row, col));
        
        return moves;
    }

    getSlidingMoves(row, col, directions) {
        const moves = [];
        const pieceColor = this.board[row][col].color;
        
        directions.forEach(([dRow, dCol]) => {
            let currentRow = row + dRow;
            let currentCol = col + dCol;
            
            while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                const targetSquare = this.board[currentRow][currentCol];
                
                if (!targetSquare) {
                    moves.push({ row: currentRow, col: currentCol });
                } else {
                    if (targetSquare.color !== pieceColor) {
                        moves.push({ row: currentRow, col: currentCol });
                    }
                    break;
                }
                
                currentRow += dRow;
                currentCol += dCol;
            }
        });
        
        return moves;
    }

    getCastlingMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        
        if (piece.hasMoved) return moves;
        
        // Kingside castling
        if (this.canCastle(row, col, true)) {
            moves.push({ row, col: col + 2 });
        }
        
        // Queenside castling
        if (this.canCastle(row, col, false)) {
            moves.push({ row, col: col - 2 });
        }
        
        return moves;
    }

    canCastle(row, col, kingside) {
        const rookCol = kingside ? 7 : 0;
        const rook = this.board[row][rookCol];
        
        if (!rook || rook.hasMoved || rook.piece !== (this.board[row][col].color === 'white' ? '♖' : '♜')) {
            return false;
        }
        
        // Check if squares between king and rook are empty
        const startCol = Math.min(col, rookCol) + 1;
        const endCol = Math.max(col, rookCol);
        
        for (let c = startCol; c < endCol; c++) {
            if (this.board[row][c]) return false;
        }
        
        // Check if king is not in check and squares are not under attack
        if (this.isInCheck(row, col)) return false;
        
        const checkCol = kingside ? col + 1 : col - 1;
        if (this.isSquareUnderAttack(row, checkCol)) return false;
        
        return true;
    }

    isInCheck(row, col) {
        return this.isSquareUnderAttack(row, col);
    }

    isSquareUnderAttack(row, col) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color !== this.currentPlayer) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        // Temporarily make the move
        const tempPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // Find king position
        const kingPiece = this.board[toRow][toCol].color === 'white' ? '♔' : '♚';
        let kingRow, kingCol;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].piece === kingPiece) {
                    kingRow = r;
                    kingCol = c;
                    break;
                }
            }
        }
        
        const inCheck = this.isInCheck(kingRow, kingCol);
        
        // Undo the move
        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = tempPiece;
        
        return inCheck;
    }

    checkGameState() {
        this.isCheck = this.isInCheck(this.getKingPosition().row, this.getKingPosition().col);
        
        if (this.isCheck) {
            this.playSound('check');
            if (this.isCheckmate()) {
                this.isCheckmate = true;
                this.isGameOver = true;
                this.playSound('checkmate');
                this.showGameOverModal();
            }
        } else if (this.isStalemate()) {
            this.isStalemate = true;
            this.isGameOver = true;
            this.showGameOverModal();
        }
    }

    getKingPosition() {
        const kingPiece = this.currentPlayer === 'white' ? '♔' : '♚';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].piece === kingPiece) {
                    return { row, col };
                }
            }
        }
    }

    isCheckmate() {
        // Check if any piece can make a move that gets out of check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    isStalemate() {
        // Check if current player has no valid moves but is not in check
        if (this.isCheck) return false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    makeComputerMove() {
        if (this.isGameOver) return;
        
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return;
        
        let selectedMove;
        
        switch (this.difficulty) {
            case 'easy':
                selectedMove = moves[Math.floor(Math.random() * moves.length)];
                break;
            case 'medium':
                selectedMove = this.getMediumMove(moves);
                break;
            case 'hard':
                selectedMove = this.getHardMove(moves);
                break;
        }
        
        this.makeMove(selectedMove.fromRow, selectedMove.fromCol, selectedMove.toRow, selectedMove.toCol);
    }

    getAllValidMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMoves(row, col);
                    validMoves.forEach(move => {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            piece: piece
                        });
                    });
                }
            }
        }
        return moves;
    }

    getMediumMove(moves) {
        // Prioritize captures and checks
        const captures = moves.filter(move => this.board[move.toRow][move.toCol]);
        const checks = moves.filter(move => {
            const tempBoard = this.cloneBoard();
            tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
            tempBoard[move.fromRow][move.fromCol] = null;
            return this.isInCheck(this.getKingPosition().row, this.getKingPosition().col);
        });
        
        if (checks.length > 0) return checks[Math.floor(Math.random() * checks.length)];
        if (captures.length > 0) return captures[Math.floor(Math.random() * captures.length)];
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getHardMove(moves) {
        // Simple evaluation function
        let bestMove = moves[0];
        let bestScore = -Infinity;
        
        moves.forEach(move => {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        
        return bestMove;
    }

    evaluateMove(move) {
        let score = 0;
        
        // Piece values
        const pieceValues = {
            '♙': 1, '♟': 1,   // Pawns
            '♖': 5, '♜': 5,   // Rooks
            '♘': 3, '♞': 3,   // Knights
            '♗': 3, '♝': 3,   // Bishops
            '♕': 9, '♛': 9,   // Queens
            '♔': 0, '♚': 0    // Kings
        };
        
        // Capture bonus
        const capturedPiece = this.board[move.toRow][move.toCol];
        if (capturedPiece) {
            score += pieceValues[capturedPiece.piece] * 10;
        }
        
        // Center control for pawns
        if (move.piece.piece === '♟' || move.piece.piece === '♙') {
            if (move.toCol >= 3 && move.toCol <= 4) score += 1;
        }
        
        // Development bonus
        if (!move.piece.hasMoved) score += 0.5;
        
        return score;
    }

    cloneBoard() {
        return this.board.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece) {
        const piece = this.board[toRow][toCol];
        const pieceSymbols = {
            '♔': 'K', '♚': 'K',
            '♕': 'Q', '♛': 'Q',
            '♖': 'R', '♜': 'R',
            '♗': 'B', '♝': 'B',
            '♘': 'N', '♞': 'N',
            '♙': '', '♟': ''
        };
        
        let notation = pieceSymbols[piece.piece];
        if (capturedPiece) {
            notation += 'x';
        }
        notation += String.fromCharCode(97 + toCol) + (8 - toRow);
        
        return notation;
    }

    addMoveToHistory(notation) {
        const moveNumber = Math.floor(this.moveHistory.length / 2) + 1;
        const isWhiteMove = this.moveHistory.length % 2 === 0;
        
        if (isWhiteMove) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            moveEntry.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span class="move-text">${notation}</span>
            `;
            this.movesContainer.appendChild(moveEntry);
        } else {
            const lastEntry = this.movesContainer.lastElementChild;
            if (lastEntry) {
                lastEntry.innerHTML += ` <span class="move-text">${notation}</span>`;
            }
        }
        
        this.moveHistory.push(notation);
    }

    updateDisplay() {
        // Update board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const piece = this.board[row][col];
                
                if (square) {
                    square.textContent = piece ? piece.piece : '';
                    square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                }
            }
        }
        
        // Update captured pieces
        this.updateCapturedPieces();
        
        // Update check indicators
        if (this.isCheck) {
            const kingPos = this.getKingPosition();
            this.highlightSquare(kingPos.row, kingPos.col, 'check');
        }
    }

    updateCapturedPieces() {
        this.capturedWhite.innerHTML = this.capturedPieces.white.map(piece => 
            `<span class="captured-piece">${piece}</span>`
        ).join('');
        
        this.capturedBlack.innerHTML = this.capturedPieces.black.map(piece => 
            `<span class="captured-piece">${piece}</span>`
        ).join('');
    }

    showGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        const message = document.getElementById('gameOverMessage');
        const details = document.getElementById('gameOverDetails');
        
        if (this.isCheckmate) {
            const winner = this.currentPlayer === 'white' ? 'Black' : 'White';
            message.innerHTML = '<i class="fas fa-trophy"></i> Checkmate!';
            details.textContent = `${winner} wins!`;
        } else if (this.isStalemate) {
            message.innerHTML = '<i class="fas fa-handshake"></i> Stalemate!';
            details.textContent = 'The game is a draw!';
        }
        
        modal.style.display = 'flex';
    }

    newGame() {
        this.resetGame();
        this.showGameModeModal();
    }

    rematch() {
        this.resetGame();
        this.startGame(this.gameMode, this.difficulty);
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.isGameOver = false;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false;
        
        document.getElementById('gameOverModal').style.display = 'none';
        this.gameContainer.classList.remove('active');
        
        this.clearHighlights();
        this.updateDisplay();
        this.movesContainer.innerHTML = '';
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // For simplicity, just reset the game
        // In a full implementation, you'd want to store the full game state
        this.resetGame();
        this.startGame(this.gameMode, this.difficulty);
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.chessBoard.style.transform = this.boardFlipped ? 'rotate(180deg)' : '';
        
        // Flip the pieces
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            if (this.boardFlipped) {
                square.style.transform = 'rotate(180deg)';
            } else {
                square.style.transform = '';
            }
        });
    }

    playSound(type) {
        const audio = document.getElementById(`${type}Sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore audio play errors
            });
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});


