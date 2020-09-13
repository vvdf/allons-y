class GameMap {
  constructor(width = 20, height = 20, defaultTile = 'g') {
    this.width = width;
    this.height = height;
    this.grid = [];
    for (let y = 0; y < height; y += 1) {
      this.grid[y] = [];
      for (let x = 0; x < width; x += 1) {
        this.grid[y][x] = defaultTile;
      }
    }
  }

  get(x, y) {
    return this.grid[y][x];
  }

  set(x, y, tile) {
    this.grid[y][x] = tile;
  }
}

export default GameMap;
