const GameMap = (width = 20, height = 20, defaultTile = 'g') => {
  const grid = [];
  for (let y = 0; y < height; y += 1) {
    grid[y] = [];
    for (let x = 0; x < width; x += 1) {
      grid[y][x] = defaultTile;
    }
  }

  return grid;
};

export default GameMap;
