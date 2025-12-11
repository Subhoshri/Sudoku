export function generateEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(board, num, row, col) {
  for (let i = 0; i < 9; i++) {
    if (
      board[row][i] === num || board[i][col] === num || board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)] === num) {
      return false;
    }
  }
  return true;
}

function findEmpty(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return null;
}

export function solveSudoku(board) {
  const empty = findEmpty(board);
  if (!empty) return true;

  const [row, col] = empty;
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, num, row, col)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = 0;
    }
  }

  return false;
}

function fillBoard(board) {
  const empty = findEmpty(board);
  if (!empty) return true;

  const [row, col] = empty;
  const nums = Array.from({ length: 9 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

  for (let num of nums) {
    if (isValid(board, num, row, col)) {
      board[row][col] = num;
      if (fillBoard(board)) return true;
      board[row][col] = 0;
    }
  }

  return false;
}

function removeCells(board, count) {
  let removed = 0;
  while (removed < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      removed++;
    }
  }
}

function getDifficultyCount(diff) {
  switch (diff) {
    case 'easy': return 40;
    case 'medium': return 50;
    case 'hard': return 60;
    case 'expert': return 70;
    default: return 50;
  }
}

export function generatePuzzle(difficulty = 'easy') {
  const board = generateEmptyBoard();
  fillBoard(board);
  const puzzle = board.map(row => row.slice());
  removeCells(puzzle, getDifficultyCount(difficulty));

  return {
    puzzle: puzzle.map(row => row.map(v => ({ value: v, fixed: v !== 0 }))),
    solution: board,
  };
}
