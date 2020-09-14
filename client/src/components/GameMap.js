const axios = require('axios');

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

  save(mapName = 'blank') {
    // save current map to file
    axios.post('/map', {
      grid: JSON.stringify(this.grid),
      name: mapName,
    })
      .then((res) => console.log(`Save attempted for: "${mapName}"`, res));
  }

  load(mapName = 'blank') {
    // load map from file
    axios.get(`/map/${mapName}`)
      .then((res) => {
        // console.log(`Load Attempted for: "${mapName}"`);
        if (Array.isArray(res.data)) {
          this.grid = res.data;
        }
      });
  }

  get(x, y) {
    return this.grid[y][x];
  }

  set(x, y, tile) {
    this.grid[y][x] = tile;
  }
}

export default GameMap;
