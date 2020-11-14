const axios = require('axios');
const tiles = require('./Tiles');

class GameMap {
  constructor(width = 20, height = 20, defaultTile = ',') {
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

  toString() {
    // parse map data as a simple 2d grid of char data to be sent/saved
    let result = '';
    for (let i = 0; i < this.grid.length; i += 1) {
      if (result.length === 0) {
        result = this.grid[i].join('');
      } else {
        result = `${result}\n${this.grid[i].join('')}`;
      }
    }
    return result;
  }

  save(mapName = 'blank') {
    // return Promise to save current map to file
    return new Promise((resolve, reject) => {
      axios.post('/map', {
        grid: this.toString(),
        name: mapName,
      })
        .then((res) => {
          if (res.status === 201) {
            resolve('Map Saved');
          } else {
            reject();
          }
        });
    });
  }

  load(mapName = 'blank') {
    // return Promise to load map from file
    return new Promise((resolve, reject) => {
      axios.get(`/map/${mapName}`)
        .then((res) => {
          console.log('Load attempted for: ', mapName, res);
          if (res.data.mapFound) {
            this.loadFromString(res.data.mapData);
            resolve('Map Loaded');
          } else {
            reject();
          }
        });
    });
  }

  loadFromString(mapData) {
    const result = mapData.split('\n');
    for (let i = 0; i < result.length; i += 1) {
      result[i] = result[i].split('');
    }
    this.grid = result;
  }

  get(x, y) {
    return this.grid[y][x];
  }

  set(x, y, tile) {
    this.grid[y][x] = tile;
    this.save();
  }
}

export default GameMap;
