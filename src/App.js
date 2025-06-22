import React, { useState, useEffect } from 'react';
import SudokuGrid from './components/SudokuGrid';
import './App.css';
import { generatePuzzle } from './utils/sudoku';
import SettingsModal from './components/SettingsModal';

function App() {
  const [board, setBoard] = useState([]);
  const [solvedBoard, setSolvedBoard] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [autoSolved, setAutoSolved] = useState(false);
  const [invalidCells, setInvalidCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [screen, setScreen] = useState('home');
  const [gameWon, setGameWon] = useState(false);
  const [theme, setTheme] = useState('light');
  const [soundOn, setSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [variant, setVariant] = useState('classic');


  const [highScores, setHighScores] = useState(() => {
    const stored = localStorage.getItem('sudoku-highscores');
    return stored ? JSON.parse(stored) : { easy: null, medium: null, hard: null, expert: null };
  });

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
}, [theme]);


  const handleSetDifficulty = (level, selectedVariant='classic') => {
    const { puzzle, solution } = generatePuzzle(level);
    setBoard(puzzle);
    setSolvedBoard(solution);
    setSeconds(0);
    setRunning(true);
    setOriginalBoard(puzzle);
    setHintCount(0);
    setDifficulty(level);
    setAutoSolved(false);
    setInvalidCells([]);
    setScreen('game');
    setVariant(selectedVariant);
  };

  const goHome = () => {
    setScreen('home');
    setRunning(false);
    setBoard([]);
    setInvalidCells([]);
  };


  //const handleSolve = () => {
  //  const copy = board.map(row => row.map(cell => cell.value));
  //  solveSudoku(copy);
  //  const solved = copy.map(row => row.map(value => ({ value, fixed: true })));
  //  setBoard(copy.map(row => row.map(value => ({ value, fixed: true }))));
  //  setRunning(false);
  //  setAutoSolved(true);
  //};

  const handleCellChange = (row, col, value) => {
    if (!/^[1-9]?$/.test(value)) return;
    const newBoard = board.map((r, i) =>
    r.map((c, j) =>
      i === row && j === col ? { ...c, value: value === '' ? 0 : parseInt(value) } : c
    )
  );

  const invalid = validateBoard(newBoard);
  setInvalidCells(invalid);
  setBoard(newBoard);
  };

  const handleRestart = () => {
  const copy = originalBoard.map(row => row.map(cell => ({ ...cell , invalid: false })));
  setBoard(copy);
  setSeconds(0);
  setRunning(true);
  };

  const handleHint = () => {
    if (hintCount >= 3 || !solvedBoard ) return;
    setTimeout(() => {
    const updated = [...board];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!updated[i][j].fixed && updated[i][j].value === 0) {
            updated[i][j].value = solvedBoard[i][j];
            updated[i][j].fixed = true;
            setBoard(updated);
            setHintCount(prev => prev + 1);
            return;
          }
        }
      }
    });
  };

  const validateBoard = (board) => {
  const invalid = [];

  const isDuplicate = (arr, value) => {
    return arr.filter(v => v === value).length > 1;
  };

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col].value;
      if (value === 0) continue;

      board[row][col].value = 0;

      for (let i = 0; i < 9; i++) {
        if (board[row][i].value === value || board[i][col].value === value) {
          invalid.push(`${row}-${col}`);
          break;
        }
      }

      const boxRow = 3 * Math.floor(row / 3);
      const boxCol = 3 * Math.floor(col / 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = boxRow + i, c = boxCol + j;
          if (board[r][c].value === value) {
            invalid.push(`${row}-${col}`);
          }
        }
      }

      board[row][col].value = value;
    }
  }

  if (variant === 'x-sudoku') {
    const mainDiagonal = [], antiDiagonal = [];
    for (let i = 0; i < 9; i++) {
      if (board[i][i].value !== 0) mainDiagonal.push(board[i][i].value);
      if (board[i][8 - i].value !== 0) antiDiagonal.push(board[i][8 - i].value);
    }

    for (let i = 0; i < 9; i++) {
      if (
        board[i][i].value !== 0 &&
        isDuplicate(mainDiagonal, board[i][i].value)
      ) {
        invalid.push(`${i}-${i}`);
      }
      if (
        board[i][8 - i].value !== 0 &&
        isDuplicate(antiDiagonal, board[i][8 - i].value)
      ) {
        invalid.push(`${i}-${8 - i}`);
      }
    }
  }

  return invalid;
};


  useEffect(() => {
  if (board.length === 0 || !solvedBoard.length || autoSolved) return;

  const isComplete = board.every((row, i) =>
    row.every((cell, j) => cell.value === solvedBoard[i][j])
  );

  if (isComplete) {
    setGameWon(true);
    setRunning(false);
    
    if (!highScores[difficulty] || seconds < highScores[difficulty]) {
      const updated = { ...highScores, [difficulty]: seconds };
      setHighScores(updated);
      localStorage.setItem('sudoku-highscores', JSON.stringify(updated));
    }
  }
}, [board]);

  return (
  <div className={`App ${theme}`}>
    {screen === 'home' ? (
      <div className="home-screen">
        <h1>Sudoku Game</h1>
        <h2>Select Difficulty</h2>

        <div className="difficulty-buttons">
          {['easy', 'medium', 'hard', 'expert'].map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={difficulty === level ? 'selected-difficulty' : ''}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="variant-buttons">
          <button onClick={() => handleSetDifficulty(difficulty, 'classic')} className={variant === 'classic' ? 'selected' : ''}>
            Classic
          </button>
          <button onClick={() => handleSetDifficulty(difficulty, 'x-sudoku')} className={variant === 'x-sudoku' ? 'selected' : ''}>
            X Sudoku
          </button>
        </div>


        <button
          className="start-game-button"
          onClick={() => handleSetDifficulty(difficulty)}
        >
          Start Game
        </button>
        <button onClick={() => setShowSettings(true)}>Settings</button>

        <div className="high-scores">
          <h3>Leaderboard</h3>
          <ul>
            {['easy', 'medium', 'hard', 'expert'].map(level => (
              <li key={level}>
                {level.toUpperCase()}: {highScores[level] ? `${highScores[level]}s` : '—'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : (
      <>
        <div className="game-controls">
          <button onClick={goHome}>Home</button>
          <button onClick={() => setRunning(prev => !prev)}>
            {running ? ' Pause ' : 'Resume'}
          </button>
          <button onClick={handleRestart}>Restart</button>
          <button onClick={handleHint} disabled={hintCount >= 3}>
            Hint ({3 - hintCount} left)
          </button>
          <button onClick={() => setShowSettings(true)}>Settings</button>          
        </div>

        <p className="timer">Time: {seconds}s</p>

        {board.length > 0 && (
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            onCellChange={handleCellChange}
            running={running}
            invalidCells={invalidCells}
            variant={variant}
          />  
        )}
        {gameWon && (
         <div className="win-screen">
           <div className="win-modal">
             <h2>🎉 You Won!</h2>
             <p>Time: {seconds}s</p>
             {(!highScores[difficulty] || seconds < highScores[difficulty]) && (
               <p>🏆 New High Score!</p>
             )}
             <button onClick={goHome}>Home</button>
             <button onClick={handleRestart}>Play Again</button>
           </div>
         </div>
        )}
       
      </>
    )}
    {showSettings && (
            <SettingsModal
              theme={theme}
              setTheme={setTheme}
              soundOn={soundOn}
              setSoundOn={setSoundOn}
              resetScores={() => {
                localStorage.removeItem('sudoku-highscores');
                setHighScores({ easy: null, medium: null, hard: null, expert: null });
              }}
              close={() => setShowSettings(false)}
            />
    )}
  </div>
);
}
export default App;
