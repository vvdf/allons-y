import axios from 'axios';
import tiles from './Tiles';

class GameMap {
  constructor(width = 20, height = 20, defaultTile = '.') {
    this.width = width;
    this.height = height;
    this.grid = [];
    this.spawn = { x: 0, y: 0 };
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

  load() {
    // return Promise to load map from file
    return new Promise((resolve, reject) => {
      axios.get(`/map`)
        .then((res) => {
          console.log('Load attempted ', res);
          if (res.data.mapFound) {
            this.height = res.data.height;
            this.width = res.data.width;
            this.loadFromString(res.data.mapData);
            this.spawn = res.data.spawn;
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

  getByPos({ x, y }) {
    return this.grid[y][x];
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width - 1 && y >= 0 && y < this.height - 1;
  }

  isWalkable({ x, y }) {
    // TODO - expand these to use a tile walkable.property check map eventually
    // so client can dynamically discern IF you should be allowed to walk on water etc
    return this.isInBounds(x, y)
      && !(this.get(x, y) === tiles.WALL || this.get(x, y) === tiles.WATER);
  }

  set(x, y, tile) {
    this.grid[y][x] = tile;
    this.save();
  }
}

export default GameMap;
