import React, {useState} from 'react';
import '../styles/SudokuGrid.css';

const SudokuGrid = ({ board, selectedCell, setSelectedCell, onCellChange, running, invalidCells, variant}) => {
  const handleSelect = (row, col) => {
    if (!board[row][col].fixed) {
      setSelectedCell({ row, col });
    }
  };
  
  return (
    <div className="sudoku-grid">
      {board.map((row, rowIndex) =>(
        <div className="sudoku-row" key={rowIndex}>
            {row.map((cell, colIndex) => {
              const isDiagonalCell = variant === 'x-sudoku' &&
              (rowIndex === colIndex || rowIndex + colIndex === 8);

              return (
                <input
                    key={`${rowIndex}-${colIndex}`}
                    className={`sudoku-cell 
                      ${cell.fixed ? 'fixed' : ''} 
                      ${invalidCells.includes(`${rowIndex}-${colIndex}`) ? 'invalid' : ''} 
                      ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''}
                        ${isDiagonalCell ? 'x-diagonal' : ''}`}
  
                    type="text"
                    maxLength="1"
                    value={cell.value === 0 ? '' : cell.value}
                    onChange={(e) => {
                      if (!running) return;
                      onCellChange(rowIndex, colIndex, e.target.value);}}
                    onClick={() => handleSelect(rowIndex, colIndex)}
                      disabled={cell.fixed}
                />
              );
          })}
        </div>
      ))}
    </div>
  );
};
export default SudokuGrid;
