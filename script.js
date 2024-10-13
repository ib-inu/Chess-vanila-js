const pieces = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
    },
};

//initial boardState
const boardState = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];



const chessboard = document.getElementById("chessboard");
let currentTurn = 'white';
let selectedPiece = null;
let selectedPosition = null;
let previousSquare = null;
let lastMove = null;


const activePlayer = document.getElementById("active-player");


function createChessBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');

            square.setAttribute('data-row', row);
            square.setAttribute('data-col', col);

            if ((col + row) % 2 === 0) {
                square.classList.add("white");
            } else {
                square.classList.add("black");
            }

            if (row === 7 || row === 0) {
                const color = row === 0 ? "black" : "white";
                if (color === "white") {
                    square.style.color = "#d2d2d2";
                    square.style.fontWeight = "500";
                }

                if (col === 0 || col === 7) square.textContent = pieces[color].rook;
                if (col === 1 || col === 6) square.textContent = pieces[color].knight;
                if (col === 2 || col === 5) square.textContent = pieces[color].bishop;
                if (col === 3) square.textContent = pieces[color].queen;
                if (col === 4) square.textContent = pieces[color].king;

            } else if (row === 1 || row === 6) {
                const color = row === 1 ? "black" : "white";
                if (color === "white") square.style.color = "#d2d2d2";
                square.textContent = pieces[color].pawn;
            }

            chessboard.appendChild(square);

        }
    }
}
createChessBoard();



function getPieceColor(piece) {
    return piece.startsWith('white') ? 'white' : 'black';
}

function getPieceType(piece) {
    return piece.split('-')[1]; // Assuming piece is in format "color-type", e.g., "white-queen"
}

//TODO: 

function isKingCheck(currentTurn) {
    const kingPiece = currentTurn === 'white' ? pieces.white.king : pieces.black.king;
    let kingRow = 0;
    let kingCol = 0;

    // Find the king's position
    outerLoop:
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (boardState[row][col] === kingPiece) {
                kingRow = row;
                kingCol = col;
                console.log(`Found king at [${kingRow}, ${kingCol}]`);
                break outerLoop;  // Completely exit the loop once the king is found
            }
        }
    }

    // Now we need to check if any opponent piece can attack the king
    const opponentColor = currentTurn === 'white' ? 'black' : 'white';
    const opponentPieces = pieces[opponentColor];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];

            // Check if the piece belongs to the opponent
            if (Object.values(opponentPieces).includes(piece)) {
                let isValidMove = false;



                console.log(piece, row, col, kingRow, kingCol);


                switch (piece) {
                    case opponentPieces.pawn:
                        isValidMove = isValidPawnMove(piece, row, col, kingRow, kingCol);
                        break;
                    case opponentPieces.rook:
                        isValidMove = isValidRookMove(row, col, kingRow, kingCol);
                        break;
                    case opponentPieces.knight:
                        isValidMove = isValidKnightMove(row, col, kingRow, kingCol);
                        break;
                    case opponentPieces.bishop:
                        isValidMove = isValidBishopMove(row, col, kingRow, kingCol);
                        break;
                    case opponentPieces.queen:
                        isValidMove = isValidQueenMove(row, col, kingRow, kingCol);
                        break;
                    case opponentPieces.king:
                        isValidMove = isValidKingMove(row, col, kingRow, kingCol);
                        break;
                }

                console.log(`Checking ${piece} at [${row}, ${col}] against king at [${kingRow}, ${kingCol}]: ${isValidMove}`);

                if (isValidMove) {
                    console.log("King is in check!");
                    return true; // The king is in check
                }
            }
        }
    }

    console.log("King is not in check.");
    return false; // The king is not in check
}







function highlightValidMoves(piece, fromRow, fromCol) {
    clearHighlights();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let isValidMove = false;
            let enPassantMove = false;

            switch (piece) {
                case pieces.white.pawn:
                case pieces.black.pawn:
                    // Check for normal pawn movement
                    isValidMove = isValidPawnMove(piece, fromRow, fromCol, row, col);
                    // If not a normal move, check for en passant
                    if (!isValidMove) {
                        isValidMove = isValidEnPassantMove(piece, fromRow, fromCol, row, col, lastMove);
                        enPassantMove = true;
                    }
                    break;
                // Other pieces logic remains the same
                case pieces.white.rook:
                case pieces.black.rook:
                    isValidMove = isValidRookMove(fromRow, fromCol, row, col);
                    break;
                case pieces.white.knight:
                case pieces.black.knight:
                    isValidMove = isValidKnightMove(fromRow, fromCol, row, col);
                    break;
                case pieces.white.bishop:
                case pieces.black.bishop:
                    isValidMove = isValidBishopMove(fromRow, fromCol, row, col);
                    break;
                case pieces.white.queen:
                case pieces.black.queen:
                    isValidMove = isValidQueenMove(fromRow, fromCol, row, col);
                    break;
                case pieces.white.king:
                case pieces.black.king:
                    isValidMove = isValidKingMove(fromRow, fromCol, row, col);
                    break;
            }

            const targetSquarePiece = boardState[row][col];
            const targetPieceColor = targetSquarePiece ? getPieceColor(targetSquarePiece) : null;

            if (isValidMove && targetPieceColor !== getPieceColor(piece)) {
                if (enPassantMove) {
                    const square = document.querySelector(`[data-row='${lastMove.fromRow + 1}'][data-col='${col}']`);
                    square.classList.add('highlight');
                } else {
                    const square = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
                    square.classList.add('highlight');

                }
            }
        }
    }

}
function clearHighlights() {
    const highlightedSquares = document.querySelectorAll('.highlight');
    highlightedSquares.forEach(square => {
        square.classList.remove('highlight');
    });

}




function getPieceColor(piece) {
    if (Object.values(pieces.white).includes(piece)) {
        return 'white';
    } else if (Object.values(pieces.black).includes(piece)) {
        return 'black';
    }
    return null;
}







function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    return !isPathBlocked(fromRow, fromCol, toRow, toCol);
}



function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

    return !isPathBlocked(fromRow, fromCol, toRow, toCol);
}

function isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
    const direction = piece === pieces.white.pawn ? -1 : 1; // White moves up, Black moves down
    const startRow = piece === pieces.white.pawn ? 6 : 1;

    // Check if moving forward
    if (fromCol === toCol) {
        // Moving forward one square
        if (toRow === fromRow + direction && boardState[toRow][toCol] === null) {
            return true;
        }
        // Moving forward two squares from the starting row
        if (fromRow === startRow && toRow === fromRow + 2 * direction && boardState[toRow][toCol] === null && boardState[fromRow + direction][toCol] === null) {
            return true;
        }
    }

    // Check if capturing diagonally
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
        const targetPiece = boardState[toRow][toCol];
        return targetPiece !== null && getPieceColor(targetPiece) !== getPieceColor(piece);
    }

    return false;
}


function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}



function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
}



function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    return rowDiff <= 1 && colDiff <= 1;
}


function isPathBlocked(fromRow, fromCol, toRow, toCol) {
    const rowDirection = Math.sign(toRow - fromRow);
    const colDirection = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (boardState[currentRow][currentCol] !== null) {
            return true;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }

    return false;
}

function isValidEnPassantMove(piece, fromRow, fromCol, toRow, toCol, lastMove) {
    // console.log("Checking en passant move...");

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    const direction = (piece === pieces.white.pawn) ? -1 : 1;


    if (!lastMove || (lastMove.piece !== pieces.white.pawn && lastMove.piece !== pieces.black.pawn)) {
        // console.log("No last move or the last move was not a pawn.");
        return false;
    }

    // console.log("Last move:", lastMove);

    const opponentPawnRow = lastMove.toRow;
    const opponentPawnCol = lastMove.toCol;



    if (Math.abs(lastMove.fromRow - lastMove.toRow) === 2 && opponentPawnCol === toCol) {
        // console.log("Opponent pawn moved two squares forward.");

        // console.log(rowDiff === 2, colDiff === 1);
        // console.log(rowDiff, colDiff);



        if (fromRow === lastMove.toRow && Math.abs(fromCol - opponentPawnCol) === 1) {
            console.log("Valid en passant move detected.");
            return true
        } else {
            // console.log("Pawn is not next to the opponent's pawn or in the correct position.");
        }
    } else {
        // console.log("Last move was not a two-square forward pawn move.");
    }


    return false;
}


chessboard.addEventListener('click', (event) => {

    const square = event.target;
    const row = parseInt(square.getAttribute('data-row'));
    const col = parseInt(square.getAttribute('data-col'));

    let pieceColor = getPieceColor(square.textContent);

    if (!selectedPiece) {
        if (square.textContent && pieceColor === currentTurn) {
            selectedPiece = square.textContent;
            selectedPosition = { row, col };
            square.classList.add('active');
            previousSquare = square;

            highlightValidMoves(selectedPiece, row, col);
        } else {
            console.log(`It's ${currentTurn}'s turn!`);
            return;
        }
    } else {
        const fromRow = parseInt(selectedPosition.row);
        const fromCol = parseInt(selectedPosition.col);
        const toRow = row;
        const toCol = col;




        let isValidMove = false;

        if (square.textContent && pieceColor === currentTurn) {
            previousSquare.classList.remove('active');
            selectedPiece = square.textContent;
            selectedPosition = { row, col };
            square.classList.add('active');
            previousSquare = square;

            highlightValidMoves(selectedPiece, row, col);
        } else {
            // Check if the move is valid for each piece type
            switch (selectedPiece) {
                case pieces.white.pawn:
                case pieces.black.pawn:
                    isValidMove = isValidPawnMove(selectedPiece, fromRow, fromCol, toRow, toCol);
                    if (!isValidMove) {
                        isValidMove = isValidEnPassantMove(selectedPiece, fromRow, fromCol, toRow, toCol, lastMove);
                    }
                    break;
                case pieces.white.rook:
                case pieces.black.rook:
                    isValidMove = isValidRookMove(fromRow, fromCol, toRow, toCol);
                    break;
                case pieces.white.knight:
                case pieces.black.knight:
                    isValidMove = isValidKnightMove(fromRow, fromCol, toRow, toCol);
                    break;
                case pieces.white.bishop:
                case pieces.black.bishop:
                    isValidMove = isValidBishopMove(fromRow, fromCol, toRow, toCol);
                    break;
                case pieces.white.queen:
                case pieces.black.queen:
                    isValidMove = isValidQueenMove(fromRow, fromCol, toRow, toCol);
                    break;
                case pieces.white.king:
                case pieces.black.king:
                    isValidMove = isValidKingMove(fromRow, fromCol, toRow, toCol);
                    break;
            }

            if (isValidMove) {
                boardState[fromRow][fromCol] = null;
                boardState[toRow][toCol] = selectedPiece;


                // Handle en passant capture
                if (isValidEnPassantMove(selectedPiece, fromRow, fromCol, toRow, toCol, lastMove)) {



                    const capturedPawnRow = fromRow; // Row where the opponent's pawn is captured
                    boardState[capturedPawnRow][toCol] = null; // Remove the captured pawn
                    const capturedSquare = document.querySelector(`[data-row='${capturedPawnRow}'][data-col='${toCol}']`);
                    capturedSquare.textContent = ''; // Clear the square where the captured pawn was
                }

                square.textContent = selectedPiece;
                pieceColor = getPieceColor(selectedPiece);
                square.style.color = (pieceColor === "white") ? "#d2d2d2" : '';

                previousSquare.classList.remove('active');
                previousSquare.textContent = '';

                lastMove = {
                    piece: selectedPiece,
                    fromRow: fromRow,
                    fromCol: fromCol,
                    toRow: toRow,
                    toCol: toCol
                };

                selectedPiece = null;
                selectedPosition = null;
                previousSquare = null;

                clearHighlights();
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                if (isKingCheck(currentTurn)) {
                    console.log(`Check for ${currentTurn}`);

                }

                activePlayer.textContent = currentTurn;
            }
        }
    }
}
)