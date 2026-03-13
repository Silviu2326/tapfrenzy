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
  animationClass: string;
}

export default function CandyCrush() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Usar ref para acceder al grid actual en callbacks
  const gridRef = useRef<Cell[]>([]);
  const isProcessingRef = useRef(false);
  
  // Sincronizar refs con estado
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Crear tablero inicial
  const createBoard = useCallback(() => {
    const newGrid: Cell[] = [];
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      newGrid.push({
        id: i,
        color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
        animationClass: ''
      });
    }
    setGrid(newGrid);
    gridRef.current = newGrid;
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

  // Obtener dirección del swap
  const getSwapDirection = (fromId: number, toId: number) => {
    if (toId === fromId + 1) return 'right';
    if (toId === fromId - 1) return 'left';
    if (toId === fromId + WIDTH) return 'down';
    if (toId === fromId - WIDTH) return 'up';
    return null;
  };

  // Verificar filas de 4 - usando ref para estado actual
  const checkRowForFour = () => {
    const currentGrid = gridRef.current;
    let matchesFound = false;
    const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55];
    
    for (let i = 0; i < 60; i++) {
      if (notValid.includes(i)) continue;
      
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const decidedColor = currentGrid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = rowOfFour.every(index => currentGrid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 4);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          rowOfFour.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].animationClass = 'anim-match';
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
                updated[index].animationClass = '';
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  };

  // Verificar columnas de 4
  const checkColumnForFour = () => {
    const currentGrid = gridRef.current;
    let matchesFound = false;
    
    for (let i = 0; i < 39; i++) {
      const columnOfFour = [i, i + WIDTH, i + WIDTH * 2, i + WIDTH * 3];
      const decidedColor = currentGrid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = columnOfFour.every(index => currentGrid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 4);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          columnOfFour.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].animationClass = 'anim-match';
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
                updated[index].animationClass = '';
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  };

  // Verificar filas de 3
  const checkRowForThree = () => {
    const currentGrid = gridRef.current;
    let matchesFound = false;
    const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55];
    
    for (let i = 0; i < 61; i++) {
      if (notValid.includes(i)) continue;
      
      const rowOfThree = [i, i + 1, i + 2];
      const decidedColor = currentGrid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = rowOfThree.every(index => currentGrid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 3);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          rowOfThree.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].animationClass = 'anim-match';
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
                updated[index].animationClass = '';
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  };

  // Verificar columnas de 3
  const checkColumnForThree = () => {
    const currentGrid = gridRef.current;
    let matchesFound = false;
    
    for (let i = 0; i < 47; i++) {
      const columnOfThree = [i, i + WIDTH, i + WIDTH * 2];
      const decidedColor = currentGrid[i]?.color;
      
      if (!decidedColor || decidedColor === '') continue;
      
      const allMatch = columnOfThree.every(index => currentGrid[index]?.color === decidedColor);
      
      if (allMatch) {
        setScore(prev => prev + 3);
        matchesFound = true;
        
        setGrid(prev => {
          const newGrid = [...prev];
          columnOfThree.forEach(index => {
            if (newGrid[index]) {
              newGrid[index].animationClass = 'anim-match';
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
                updated[index].animationClass = '';
              }
            });
            return updated;
          });
        }, 450);
      }
    }
    
    return matchesFound;
  };

  // Mover caramelos hacia abajo
  const moveIntoSquareBelow = () => {
    setGrid(prev => {
      const newGrid = [...prev];
      
      // Para cada columna
      for (let col = 0; col < WIDTH; col++) {
        // Empezar desde abajo y subir
        for (let row = WIDTH - 1; row >= 0; row--) {
          const index = row * WIDTH + col;
          
          // Si esta celda está vacía
          if (newGrid[index].color === '') {
            // Buscar el primer caramelo no vacío arriba
            let foundCandy = false;
            for (let searchRow = row - 1; searchRow >= 0; searchRow--) {
              const searchIndex = searchRow * WIDTH + col;
              
              if (newGrid[searchIndex].color !== '') {
                // Mover este caramelo hacia abajo
                newGrid[index].color = newGrid[searchIndex].color;
                newGrid[index].animationClass = 'anim-drop';
                newGrid[searchIndex].color = '';
                foundCandy = true;
                
                // Limpiar animación después
                setTimeout(() => {
                  setGrid(current => {
                    const updated = [...current];
                    if (updated[index]) {
                      updated[index].animationClass = '';
                    }
                    return updated;
                  });
                }, 700);
                
                break;
              }
            }
            
            // Si no encontramos caramelo arriba, generar uno nuevo
            if (!foundCandy) {
              const newColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
              newGrid[index].color = newColor;
              newGrid[index].animationClass = 'anim-appear';
              
              // Limpiar animación después
              setTimeout(() => {
                setGrid(current => {
                  const updated = [...current];
                  if (updated[index]) {
                    updated[index].animationClass = '';
                  }
                  return updated;
                });
              }, 500);
            }
          }
        }
      }
      
      return newGrid;
    });
  };

  // Intervalo para verificar matches
  useEffect(() => {
    const interval = setInterval(() => {
      if (isProcessingRef.current) return;
      
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
    
    return () => clearInterval(interval);
  }, []);

  // Intercambiar dos celdas
  const swapCells = (id1: number, id2: number) => {
    if (!isAdjacent(id1, id2)) return false;
    
    const currentGrid = gridRef.current;
    const color1 = currentGrid[id1]?.color;
    const color2 = currentGrid[id2]?.color;
    
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[id1].color = color2;
      newGrid[id2].color = color1;
      
      const dir1 = getSwapDirection(id1, id2);
      const dir2 = getSwapDirection(id2, id1);
      if (dir1) newGrid[id1].animationClass = `anim-swap-${dir1}`;
      if (dir2) newGrid[id2].animationClass = `anim-swap-${dir2}`;
      
      setTimeout(() => {
        setGrid(current => {
          const updated = [...current];
          if (updated[id1]) updated[id1].animationClass = '';
          if (updated[id2]) updated[id2].animationClass = '';
          return updated;
        });
      }, 400);
      
      return newGrid;
    });
    
    return true;
  };

  // Procesar un movimiento y verificar si crea matches
  const processMove = (id1: number, id2: number) => {
    if (!isAdjacent(id1, id2) || isProcessingRef.current) return;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    
    const currentGrid = gridRef.current;
    const color1 = currentGrid[id1]?.color;
    const color2 = currentGrid[id2]?.color;
    
    // Realizar swap
    swapCells(id1, id2);
    
    // Esperar a que el swap se complete y verificar matches
    setTimeout(() => {
      const hasMatches = checkRowForFour() || checkColumnForFour() || checkRowForThree() || checkColumnForThree();
      
      if (!hasMatches) {
        // Revertir si no hay matches
        setTimeout(() => {
          setGrid(prev => {
            const newGrid = [...prev];
            newGrid[id1].color = color1;
            newGrid[id2].color = color2;
            newGrid[id1].animationClass = 'anim-shake';
            newGrid[id2].animationClass = 'anim-shake';
            
            setTimeout(() => {
              setGrid(current => {
                const updated = [...current];
                updated[id1].animationClass = '';
                updated[id2].animationClass = '';
                return updated;
              });
              setIsProcessing(false);
              isProcessingRef.current = false;
            }, 600);
            
            return newGrid;
          });
        }, 400);
      } else {
        setTimeout(() => {
          setIsProcessing(false);
          isProcessingRef.current = false;
        }, 600);
      }
    }, 400);
  };

  // Drag events
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(draggedId)) {
      processMove(draggedId, id);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    const touch = e.touches[0];
    (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
    (e.currentTarget as HTMLElement).dataset.touchStartY = touch.clientY.toString();
    (e.currentTarget as HTMLElement).dataset.touchId = id.toString();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const startX = parseFloat(target.dataset.touchStartX || '0');
    const startY = parseFloat(target.dataset.touchStartY || '0');
    const startId = parseInt(target.dataset.touchId || '-1');
    
    if (startId === -1) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const minSwipeDistance = 30;
    
    let targetCell: number | null = null;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && (startId % WIDTH) < WIDTH - 1) {
          targetCell = startId + 1;
        } else if (deltaX < 0 && (startId % WIDTH) > 0) {
          targetCell = startId - 1;
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && Math.floor(startId / WIDTH) < WIDTH - 1) {
          targetCell = startId + WIDTH;
        } else if (deltaY < 0 && Math.floor(startId / WIDTH) > 0) {
          targetCell = startId - WIDTH;
        }
      }
    }
    
    if (targetCell !== null) {
      processMove(startId, targetCell);
    }
    
    // Limpiar dataset
    delete target.dataset.touchStartX;
    delete target.dataset.touchStartY;
    delete target.dataset.touchId;
  };

  // Click para selección
  const handleCellClick = (id: number) => {
    if (isProcessingRef.current) return;
    
    if (selectedCell === null) {
      setSelectedCell(id);
    } else if (selectedCell === id) {
      setSelectedCell(null);
    } else if (isAdjacent(selectedCell, id)) {
      processMove(selectedCell, id);
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
        
        <div className="candy-grid">
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
              onTouchEnd={handleTouchEnd}
              onClick={() => handleCellClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
