import { useState, useEffect } from 'react';

type Player = 'X' | 'O';
type Square = Player | null;

export default function ConnectFour() {
  const ROWS = 6;
  const COLS = 7;

  const [board, setBoard] = useState<Square[]>(Array(ROWS * COLS).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Square>(null);
  const [validColumns, setValidColumns] = useState<boolean[]>(Array(COLS).fill(true));

  const checkWinner = (squares: Square[]): Square => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const idx = row * COLS + col;
        if (
          squares[idx] &&
          squares[idx] === squares[idx + 1] &&
          squares[idx] === squares[idx + 2] &&
          squares[idx] === squares[idx + 3]
        ) {
          return squares[idx];
        }
      }
    }

    // Vérifier les colonnes
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const idx = row * COLS + col;
        if (
          squares[idx] &&
          squares[idx] === squares[(row + 1) * COLS + col] &&
          squares[idx] === squares[(row + 2) * COLS + col] &&
          squares[idx] === squares[(row + 3) * COLS + col]
        ) {
          return squares[idx];
        }
      }
    }

    // Vérifier les diagonales (↘)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const idx = row * COLS + col;
        if (
          squares[idx] &&
          squares[idx] === squares[(row + 1) * COLS + (col + 1)] &&
          squares[idx] === squares[(row + 2) * COLS + (col + 2)] &&
          squares[idx] === squares[(row + 3) * COLS + (col + 3)]
        ) {
          return squares[idx];
        }
      }
    }

    // Vérifier les diagonales (↙)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const idx = row * COLS + col;
        if (
          squares[idx] &&
          squares[idx] === squares[(row + 1) * COLS + (col - 1)] &&
          squares[idx] === squares[(row + 2) * COLS + (col - 2)] &&
          squares[idx] === squares[(row + 3) * COLS + (col - 3)]
        ) {
          return squares[idx];
        }
      }
    }

    return null;
  };

  const dropPiece = (col: number, player: Player, currentBoard: Square[]): Square[] | null => {
    const newBoard = [...currentBoard];
    for (let row = ROWS - 1; row >= 0; row--) {
      const idx = row * COLS + col;
      if (newBoard[idx] === null) {
        newBoard[idx] = player;
        return newBoard;
      }
    }
    return null;
  };

  const isColumnValid = (col: number, currentBoard: Square[]): boolean => {
    return currentBoard[col] === null;
  };

  const updateValidColumns = (currentBoard: Square[]) => {
    const valid = Array(COLS)
      .fill(0)
      .map((_, col) => isColumnValid(col, currentBoard));
    setValidColumns(valid);
  };

  const evaluateLine = (line: Square[], player: Player): number => {
    const opponent: Player = player === 'O' ? 'X' : 'O';
    let playerCount = 0;
    let opponentCount = 0;

    for (let cell of line) {
      if (cell === player) playerCount++;
      else if (cell === opponent) opponentCount++;
    }

    if (playerCount === 4) return 10000;
    if (opponentCount === 4) return -10000;
    if (opponentCount > 0) return 0;
    if (playerCount === 3) return 50;
    if (playerCount === 2) return 10;
    if (playerCount === 1) return 1;

    return 0;
  };

  const evaluatePosition = (squares: Square[], player: Player): number => {
    let score = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const idx = row * COLS + col;
        score += evaluateLine(
          [squares[idx], squares[idx + 1], squares[idx + 2], squares[idx + 3]],
          player
        );
      }
    }

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const idx = row * COLS + col;
        score += evaluateLine(
          [
            squares[idx],
            squares[(row + 1) * COLS + col],
            squares[(row + 2) * COLS + col],
            squares[(row + 3) * COLS + col],
          ],
          player
        );
      }
    }

    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const idx = row * COLS + col;
        score += evaluateLine(
          [
            squares[idx],
            squares[(row + 1) * COLS + (col + 1)],
            squares[(row + 2) * COLS + (col + 2)],
            squares[(row + 3) * COLS + (col + 3)],
          ],
          player
        );
      }
    }

    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const idx = row * COLS + col;
        score += evaluateLine(
          [
            squares[idx],
            squares[(row + 1) * COLS + (col - 1)],
            squares[(row + 2) * COLS + (col - 2)],
            squares[(row + 3) * COLS + (col - 3)],
          ],
          player
        );
      }
    }

    return score;
  };

  const makeAIMove = (currentBoard: Square[]): Square[] | null => {
    let bestScore = -Infinity;
    let bestMoves: number[] = [];

    for (let col = 0; col < COLS; col++) {
      if (isColumnValid(col, currentBoard)) {
        const testBoard = dropPiece(col, 'O', currentBoard);
        if (!testBoard) continue;

        const score = evaluatePosition(testBoard, 'O') - evaluatePosition(testBoard, 'X');
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [col];
        } else if (score === bestScore) {
          bestMoves.push(col);
        }
      }
    }

    if (bestMoves.length === 0) return null;
    const chosenCol = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return dropPiece(chosenCol, 'O', currentBoard);
  };

  const handleColumnClick = (col: number) => {
    if (!isPlayerTurn || gameOver || !validColumns[col]) return;

    const newBoard = dropPiece(col, 'X', board);
    if (!newBoard) return;

    const w = checkWinner(newBoard);
    if (w) {
      setBoard(newBoard);
      setWinner(w);
      setGameOver(true);
      return;
    }

    if (newBoard.every(cell => cell !== null)) {
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    setBoard(newBoard);
    setIsPlayerTurn(false);
    updateValidColumns(newBoard);
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const newBoard = makeAIMove(board);
        if (!newBoard) {
          setGameOver(true);
          return;
        }

        const w = checkWinner(newBoard);
        if (w) {
          setBoard(newBoard);
          setWinner(w);
          setGameOver(true);
          return;
        }

        if (newBoard.every(cell => cell !== null)) {
          setBoard(newBoard);
          setGameOver(true);
          return;
        }

        setBoard(newBoard);
        setIsPlayerTurn(true);
        updateValidColumns(newBoard);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, board]);

  useEffect(() => {
    updateValidColumns(board);
  }, [board]);

  const resetGame = () => {
    setBoard(Array(ROWS * COLS).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-5xl font-bold text-center mb-2 text-gray-800">Puissance 4</h1>
        <p className="text-center text-gray-600 mb-6">Joue contre l'IA</p>

        <div className="mb-6 p-4 bg-blue-100 rounded-lg text-center">
          {gameOver ? (
            <p className="text-xl font-bold text-gray-800">
              {winner === 'X' ? '🎉 Tu as gagné !' : winner === 'O' ? '😢 L\'IA a gagné !' : '🤝 Match nul !'}
            </p>
          ) : (
            <p className="text-lg text-gray-700">
              {isPlayerTurn ? '👤 C\'est ton tour (bleu)' : '🤖 L\'IA joue (rouge)...'}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: '8px',
            marginBottom: '24px',
            backgroundColor: '#1e40af',
            padding: '12px',
            borderRadius: '12px',
          }}
        >
          {board.map((value, index) => {
            const col = index % COLS;
            return (
              <div key={index} className="aspect-square">
                <button
                  onClick={() => handleColumnClick(col)}
                  disabled={!validColumns[col] || !isPlayerTurn || gameOver}
                  className={`w-full h-full rounded-full border-2 border-blue-800 text-2xl font-bold transition flex items-center justify-center ${
                    validColumns[col] && isPlayerTurn && !gameOver
                      ? 'cursor-pointer hover:opacity-80'
                      : 'cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor:
                      value === 'X'
                        ? '#3b82f6'
                        : value === 'O'
                          ? '#ef4444'
                          : '#f3f4f6',
                  }}
                >
                  {value === 'X' ? '🔵' : value === 'O' ? '🔴' : ''}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
        >
          Nouvelle partie
        </button>
      </div>
    </div>
  );
}
