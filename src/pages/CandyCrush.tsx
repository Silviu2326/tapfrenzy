import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandyCrush.css';

const WIDTH = 8;
const CANDY_COLORS = [
  '/assets/CERVEZA_MEDUSA.png',
  '/assets/CERVEZA_CATIRA.png',
  '/assets/CERVEZA_CANDELA.png',
  '/assets/CERVEZA_GUAJIRA.png',
  '/assets/CERVEZA_SIFRINA.png',
  '/assets/CERVEZA_MORENA.png'
];

interface Cell {
  id: number;
  color: string;
  isMatched: boolean;
  isAnimating: boolean;
  animationClass: string;
}

export default function CandyCrush() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [draggedCell, setDraggedCell] = useState<number | null>(null);
  const [replacedCell, setReplacedCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number; id: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Crear tablero inicial
  const createBoard = useCallback(() => {
    const newGrid: Cell[] = [];
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      newGrid.push({
        id: i,
        color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
        isMatched: false,
        isAnimating: false,
        animationClass: ''
      });
    }
    setGrid(newGrid);
  }, []);

  // Inicializar tablero
  useEffect(() => {
    createBoard();
  }, [createBoard]);

  // Verificar si dos celdas son adyacentes
  const isAdjacent = (id1: number, id2: number) => {
    const row1 = Math.floor(id1 / WIDTH);
    const col1 = id1 % WIDTH;
    const row2 = Math.floor(id2 / WIDTH);
    const col2 = id2 % WIDTH;
    
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // Intercambiar dos celdas
  const swapCells = useCallback((id1: number, id2: number, animate = true) => {
    if (!isAdjacent(id1, id2)) return false;
    
    setGrid(prev => {
      const newGrid = [...prev];
      const temp = newGrid[id1].color;
      newGrid[id1].color = newGrid[id2].color;
      newGrid[id2].color = temp;
      
      if (animate) {
        const dir1 = getSwapDirection(id1, id2);
        const dir2 = getSwapDirection(id2, id1);
        if (dir1) {
          newGrid[id1].animationClass = `anim-swap-${dir1}`;
          newGrid[id1].isAnimating = true;
        }
        if (dir2) {
          newGrid[id2].animationClass = `anim-swap-${dir2}`;
          newGrid[id2].isAnimating = true;
        }
        
        setTimeout(() => {
          setGrid(current => {
            const updated = [...current];
            if (updated[id1]) {
              updated[id1].animationClass = '';
              updated[id1].isAnimating = false;
            }
            if (updated[id2]) {
              updated[id2].animationClass = '';
              updated[id2].isAnimating = false;
            }
            return updated;
          });
        }, 400);
      }
      
      return newGrid;
    });
    
    return true;
  }, []);

  // Obtener dirección del swap
  const getSwapDirection = (fromId: number, toId: number) => {
    if (toId === fromId + 1) return 'right';
    if (toId === fromId - 1) return 'left';
    if (toId === fromId + WIDTH) return 'down';
    if (toId === fromId - WIDTH) return 'up';
    return null;
  };

  // Verificar filas de 4
  const checkRowForFour = useCallback(() => {
    let matchesFound = false;
    const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55];
    
    for (let i = 0; i < 60; i++) {
      if (notValid.includes(i)) continue;
      
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const decidedColor = grid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = rowOfFour.every(index => grid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 4);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          rowOfFour.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].isMatched = true;
              newGrid[index].animationClass = 'anim-match';
              newGrid[index].isAnimating = true;
            }
          });
          return newGrid;
        });
        
        setTimeout(() => {
          setGrid(current => {
            const updated = [...current];
            rowOfFour.forEach(index => {
              if (updated[index]) {
                updated[index].color = '';
                updated[index].isMatched = false;
                updated[index].animationClass = '';
                updated[index].isAnimating = false;
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  }, [grid]);

  // Verificar columnas de 4
  const checkColumnForFour = useCallback(() => {
    let matchesFound = false;
    
    for (let i = 0; i < 39; i++) {
      const columnOfFour = [i, i + WIDTH, i + WIDTH * 2, i + WIDTH * 3];
      const decidedColor = grid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = columnOfFour.every(index => grid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 4);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          columnOfFour.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].isMatched = true;
              newGrid[index].animationClass = 'anim-match';
              newGrid[index].isAnimating = true;
            }
          });
          return newGrid;
        });
        
        setTimeout(() => {
          setGrid(current => {
            const updated = [...current];
            columnOfFour.forEach(index => {
              if (updated[index]) {
                updated[index].color = '';
                updated[index].isMatched = false;
                updated[index].animationClass = '';
                updated[index].isAnimating = false;
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  }, [grid]);

  // Verificar filas de 3
  const checkRowForThree = useCallback(() => {
    let matchesFound = false;
    const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55];
    
    for (let i = 0; i < 61; i++) {
      if (notValid.includes(i)) continue;
      
      const rowOfThree = [i, i + 1, i + 2];
      const decidedColor = grid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = rowOfThree.every(index => grid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 3);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          rowOfThree.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].isMatched = true;
              newGrid[index].animationClass = 'anim-match';
              newGrid[index].isAnimating = true;
            }
          });
          return newGrid;
        });
        
        setTimeout(() => {
          setGrid(current => {
            const updated = [...current];
            rowOfThree.forEach(index => {
              if (updated[index]) {
                updated[index].color = '';
                updated[index].isMatched = false;
                updated[index].animationClass = '';
                updated[index].isAnimating = false;
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  }, [grid]);

  // Verificar columnas de 3
  const checkColumnForThree = useCallback(() => {
    let matchesFound = false;
    
    for (let i = 0; i < 47; i++) {
      const columnOfThree = [i, i + WIDTH, i + WIDTH * 2];
      const decidedColor = grid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = columnOfThree.every(index => grid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 3);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          columnOfThree.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].isMatched = true;
              newGrid[index].animationClass = 'anim-match';
              newGrid[index].isAnimating = true;
            }
          });
          return newGrid;
        });
        
        setTimeout(() => {
          setGrid(current => {
            const updated = [...current];
            columnOfThree.forEach(index => {
              if (updated[index]) {
                updated[index].color = '';
                updated[index].isMatched = false;
                updated[index].animationClass = '';
                updated[index].isAnimating = false;
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  }, [grid]);

  // Mover caramelos hacia abajo
  const moveIntoSquareBelow = useCallback(() => {
    setGrid(prev => {
      const newGrid = [...prev];
      
      // Mover caramelos hacia abajo (de abajo hacia arriba)
      for (let i = 55; i >= 0; i--) {
        if (newGrid[i + WIDTH]?.color === '' && newGrid[i]?.color !== '') {
          newGrid[i + WIDTH].color = newGrid[i].color;
          newGrid[i].color = '';
          newGrid[i + WIDTH].animationClass = 'anim-drop';
          newGrid[i + WIDTH].isAnimating = true;
          
          setTimeout(() => {
            setGrid(current => {
              const updated = [...current];
              if (updated[i + WIDTH]) {
                updated[i + WIDTH].animationClass = '';
                updated[i + WIDTH].isAnimating = false;
              }
              return updated;
            });
          }, 700);
        }
      }
      
      // Llenar primera fila con nuevos caramelos
      for (let i = 0; i < WIDTH; i++) {
        if (newGrid[i]?.color === '') {
          newGrid[i].color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
          newGrid[i].animationClass = 'anim-appear';
          newGrid[i].isAnimating = true;
          
          setTimeout(() => {
            setGrid(current => {
              const updated = [...current];
              if (updated[i]) {
                updated[i].animationClass = '';
                updated[i].isAnimating = false;
              }
              return updated;
            });
          }, 500);
        }
      }
      
      return newGrid;
    });
  }, []);

  // Intervalo para verificar matches
  useEffect(() => {
    if (isProcessing) return;
    
    intervalRef.current = setInterval(() => {
      const row4 = checkRowForFour();
      const col4 = checkColumnForFour();
      const row3 = checkRowForThree();
      const col3 = checkColumnForThree();
      
      if (row4 || col4 || row3 || col3) {
        setTimeout(() => {
          moveIntoSquareBelow();
        }, 500);
      }
    }, 150);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkRowForFour, checkColumnForFour, checkRowForThree, checkColumnForThree, moveIntoSquareBelow, isProcessing]);

  // Drag events
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCell(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setReplacedCell(id);
  };

  // Procesar drag and drop
  useEffect(() => {
    if (draggedCell !== null && replacedCell !== null) {
      if (draggedCell === replacedCell) {
        setDraggedCell(null);
        setReplacedCell(null);
        return;
      }
      
      const isValidMove = isAdjacent(draggedCell, replacedCell);
      
      if (isValidMove) {
        setIsProcessing(true);
        const colorDragged = grid[draggedCell]?.color;
        const colorReplaced = grid[replacedCell]?.color;
        
        swapCells(draggedCell, replacedCell);
        
        // Verificar si el movimiento crea matches
        setTimeout(() => {
          const hasMatches = checkRowForFour() || checkColumnForFour() || checkRowForThree() || checkColumnForThree();
          
          if (!hasMatches) {
            // Revertir si no hay matches
            setTimeout(() => {
              setGrid(prev => {
                const newGrid = [...prev];
                newGrid[draggedCell].color = colorDragged;
                newGrid[replacedCell].color = colorReplaced;
                newGrid[draggedCell].animationClass = 'anim-shake';
                newGrid[replacedCell].animationClass = 'anim-shake';
                
                setTimeout(() => {
                  setGrid(current => {
                    const updated = [...current];
                    updated[draggedCell].animationClass = '';
                    updated[replacedCell].animationClass = '';
                    return updated;
                  });
                  setIsProcessing(false);
                }, 600);
                
                return newGrid;
              });
            }, 400);
          } else {
            setTimeout(() => setIsProcessing(false), 600);
          }
        }, 400);
      }
      
      setDraggedCell(null);
      setReplacedCell(null);
    }
  }, [draggedCell, replacedCell, grid, swapCells, checkRowForFour, checkColumnForFour, checkRowForThree, checkColumnForThree]);

  // Touch events - Versión mejorada
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY, id });
  };

  const handleTouchMove = (_e: React.TouchEvent) => {
    // No prevenir default para permitir scroll nativo si es necesario
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    const minSwipeDistance = 30;
    
    const draggedId = touchStartPos.id;
    let targetCell: number | null = null;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && (draggedId % WIDTH) < WIDTH - 1) {
          targetCell = draggedId + 1;
        } else if (deltaX < 0 && (draggedId % WIDTH) > 0) {
          targetCell = draggedId - 1;
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && Math.floor(draggedId / WIDTH) < WIDTH - 1) {
          targetCell = draggedId + WIDTH;
        } else if (deltaY < 0 && Math.floor(draggedId / WIDTH) > 0) {
          targetCell = draggedId - WIDTH;
        }
      }
    }
    
    if (targetCell !== null && !isProcessing) {
      setIsProcessing(true);
      const colorDragged = grid[draggedId]?.color;
      const colorReplaced = grid[targetCell]?.color;
      
      swapCells(draggedId, targetCell);
      
      setTimeout(() => {
        const hasMatches = checkRowForFour() || checkColumnForFour() || checkRowForThree() || checkColumnForThree();
        
        if (!hasMatches) {
          setTimeout(() => {
            setGrid(prev => {
              const newGrid = [...prev];
              newGrid[draggedId].color = colorDragged;
              newGrid[targetCell!].color = colorReplaced;
              newGrid[draggedId].animationClass = 'anim-shake';
              newGrid[targetCell!].animationClass = 'anim-shake';
              
              setTimeout(() => {
                setGrid(current => {
                  const updated = [...current];
                  updated[draggedId].animationClass = '';
                  updated[targetCell!].animationClass = '';
                  return updated;
                });
                setIsProcessing(false);
              }, 600);
              
              return newGrid;
            });
          }, 400);
        } else {
          setTimeout(() => setIsProcessing(false), 600);
        }
      }, 400);
    }
    
    setTouchStartPos(null);
  };

  // Click para selección
  const handleCellClick = (id: number) => {
    if (isProcessing) return;
    
    if (selectedCell === null) {
      setSelectedCell(id);
    } else if (selectedCell === id) {
      setSelectedCell(null);
    } else if (isAdjacent(selectedCell, id)) {
      setIsProcessing(true);
      const colorSelected = grid[selectedCell]?.color;
      const colorClicked = grid[id]?.color;
      
      swapCells(selectedCell, id);
      
      setTimeout(() => {
        const hasMatches = checkRowForFour() || checkColumnForFour() || checkRowForThree() || checkColumnForThree();
        
        if (!hasMatches) {
          setTimeout(() => {
            setGrid(prev => {
              const newGrid = [...prev];
              newGrid[selectedCell].color = colorSelected;
              newGrid[id].color = colorClicked;
              newGrid[selectedCell].animationClass = 'anim-shake';
              newGrid[id].animationClass = 'anim-shake';
              
              setTimeout(() => {
                setGrid(current => {
                  const updated = [...current];
                  updated[selectedCell].animationClass = '';
                  updated[id].animationClass = '';
                  return updated;
                });
                setIsProcessing(false);
              }, 600);
              
              return newGrid;
            });
          }, 400);
        } else {
          setTimeout(() => setIsProcessing(false), 600);
        }
      }, 400);
      
      setSelectedCell(null);
    } else {
      setSelectedCell(id);
    }
  };

  return (
    <div className="candy-crush-wrapper">
      <button className="back-button" onClick={() => navigate('/menu')}>
        ← Volver al Menú
      </button>
      
      <div className="candy-crush-container">
        <div className="score-board-candy">
          <h3>Score</h3>
          <h1 className={score > 0 ? 'score-update' : ''}>{score}</h1>
        </div>
        
        <div className="candy-grid" ref={gridRef}>
          {grid.map((cell, index) => (
            <div
              key={cell.id}
              className={`candy-cell ${cell.animationClass} ${selectedCell === index ? 'selected' : ''}`}
              style={{ 
                backgroundImage: cell.color ? `url(${cell.color})` : 'none',
                opacity: cell.color ? 1 : 0
              }}
              draggable={!isProcessing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => handleCellClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
