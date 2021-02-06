const { generateID, rng } = require('./utility');
const mapTools = require('./mapTools');

const tiles = {
  WALL: '#',
  WATER: '~',
  ROAD: '_',
  DIRT: '.',
  GRASS: ',',
  TREE: 'T',
};

class GameMap {
  constructor(type = 'rogue', width = 100, height = 100) {
    this.mid = `MID${generateID()}`;
    this.width = width;
    this.height = height;
    this.grid = [];
    this.entityPositionMap = {}; // map of eids to their map positions
    this.spawn = { x: -1, y: -1 };
    this.generate(type);
  }

  // -- ENTITY INTERACTION METHODS
  addEntity(eid) {
    this.entityPositionMap[eid] = { x: this.spawn.x, y: this.spawn.y };
    this.findNextSpawn();
  }

  getEntities() {
    return this.entityPositionMap;
  }

  getEntityPos(eid) {
    return this.entityPositionMap[eid];
  }

  hasEntity(eid) {
    return {}.hasOwnProperty(this.entityPositionMap, eid);
  }

  moveEntity(eid, targetX, targetY) {
    const { x, y } = this.entityPositionMap[eid];
    if (Math.abs(targetX - x + targetY - y) === 1 && this.isWalkable(targetX, targetY)) {
      // move has a correct delta AND target cell is walkable
      this.entityPositionMap[eid].x = targetX;
      this.entityPositionMap[eid].y = targetY;
      return true; // move was successful
    }
    return false; // move attempt was not successful
  }

  // -- MAP GENERATION/MANIPULATION METHODS
  clear(wallTile = '#') {
    this.grid = [];
    for (let i = 0; i < this.height; i += 1) {
      const newArr = [];
      for (let j = 0; j < this.width; j += 1) {
        newArr.push(wallTile);
      }
      this.grid.push(newArr);
    }
  }

  generate(type = 'rogue', floorTile = '.', wallTile = '#') {
    this.clear(wallTile);
    if (type === 'rogue') {
      const ROOM_MAX = Math.floor((this.width * this.height) / 100);
      let roomCount = 0;
      const rooms = [];
      for (let attempts = 0; roomCount < ROOM_MAX && attempts < 1000; attempts += 1) {
        const roomWidth = rng(3, 8);
        const roomHeight = rng(2, 8);
        const startX = rng(1, (this.width - roomWidth) - 1);
        const startY = rng(1, (this.height - roomHeight) - 1);
        if (this.grid[startY][startX] === wallTile) {
          roomCount += 1;
          this.fillRect(floorTile, roomWidth, roomHeight, startX, startY);
          rooms.push({
            x: Math.floor(startX + roomWidth / 2),
            y: Math.floor(startY + roomHeight / 2),
            connected: false,
          });
        }
      }

      rooms[0].connected = true;
      for (let currentRoomIdx = 0; currentRoomIdx < rooms.length; currentRoomIdx += 1) {
        // find nearest room
        let nearestRoomIdx = 0;
        let nearestRoomDelta = this.width + this.height;
        for (let i = 0; i < rooms.length; i += 1) {
          if (i !== currentRoomIdx) {
            const deltaX = Math.abs(rooms[i].x - rooms[currentRoomIdx].x);
            const deltaY = Math.abs(rooms[i].y - rooms[currentRoomIdx].y);
            const deltaTri = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            if (deltaTri * (rooms[i].connected ? 1.5 : 1) < nearestRoomDelta) {
              // weighted towards connected rooms
              nearestRoomIdx = i;
              nearestRoomDelta = deltaTri;
            }
          }
        }
        this.drawDrunkLine(floorTile, rooms[currentRoomIdx].x, rooms[currentRoomIdx].y,
          rooms[nearestRoomIdx].x, rooms[nearestRoomIdx].y);
        if (rooms[currentRoomIdx].connected || rooms[nearestRoomIdx].connected) {
          rooms[currentRoomIdx].connected = true;
          rooms[nearestRoomIdx].connected = true;
        }
      }
      // forcibly connect remaining unconnected rooms
      this.forceConnections(floorTile);
    }

    // establish viable spawn location
    this.findNextSpawn(floorTile);
  }

  findNextSpawn(floorTile = '.') {
    this.spawn = mapTools.findNearest(
      this.grid,
      floorTile,
      rng(0, this.width - 1),
      rng(0, this.height - 1),
    );
  }

  fillRect(tile, width, height, startX, startY) {
    for (let i = startY; i < startY + height; i += 1) {
      for (let j = startX; j < startX + width; j += 1) {
        this.grid[i][j] = tile;
      }
    }
  }

  drawDrunkLine(tile, startX, startY, endX, endY) {
    // console.log('STARTXY:', startX, startY, 'ENDXY: ', endX, endY);
    this.grid[startY][startX] = tile;
    const nextSignX = endX - startX >= 0 ? 1 : -1;
    const nextSignY = endY - startY >= 0 ? 1 : -1;
    if (startX !== endX && startY !== endY) {
      const drunkDecision = rng(0, 1);
      if (drunkDecision < 1) {
        this.drawDrunkLine(tile, startX + nextSignX, startY, endX, endY);
      } else {
        this.drawDrunkLine(tile, startX, startY + nextSignY, endX, endY);
      }
    } else if (startX === endX && startY !== endY) {
      this.drawDrunkLine(tile, startX, startY + nextSignY, endX, endY);
    } else if (startY === endY && startX !== endX) {
      this.drawDrunkLine(tile, startX + nextSignX, startY, endX, endY);
    } else {
      this.grid[endY][endX] = tile;
    }
  }

  forceConnections(floorTile = '.') {
    // create a map to determine where we can explore and
    // where we HAVE explored
    // 0 = unexplorable, 1 = explorable, 2 = explored

    const exploredMapDictionary = {
      '#': 0,
      '~': 0,
      everythingElse: 1,
    };
    let exploreMap = mapTools.copyMap(this.grid, exploredMapDictionary);
    const start = mapTools.findFirst(exploreMap, 1);
    mapTools.exploreAndPaint(exploreMap, 1, 2, start.x, start.y);

    while (mapTools.findFirst(exploreMap, 1).exists) {
      const origin = mapTools.findFirst(exploreMap, 1);
      const nearest = mapTools.findNearest(exploreMap, 2, origin.x, origin.y);
      this.drawDrunkLine(floorTile, origin.x, origin.y, nearest.x, nearest.y);

      // update explorationMap and re-explore it
      exploreMap = mapTools.copyMap(this.grid, exploredMapDictionary);
      mapTools.exploreAndPaint(exploreMap, 1, 2, start.x, start.y);
    }
  }

  // -- MAP HELPER MeTHODS
  isInBounds(x, y) {
    return mapTools.isInBounds(this.grid, x, y);
  }

  isWalkable(targetX, targetY) {
    // TODO: rebuild tile definition to inherently manage passability
    if (!this.isInBounds(targetX, targetY)
      || this.getTile(targetX, targetY) === tiles.WALL
      || this.getTile(targetX, targetY) === tiles.WATER) {
      return false;
    }

    // is in bounds, not a wall, test against entities
    for (let eidKey in this.entityPositionMap) {
      const { x, y } = this.entityPositionMap[eidKey];
      if (targetX === x && targetY === y) {
        return false;
      }
    }
    return true;
  }

  toString() {
    return mapTools.mapToString(this.grid);
  }

  getTile(x, y) {
    return this.grid[y][x];
  }

  getMapObj() {
    // parse map object to a client-friendly shape
    return {
      mid: this.mid,
      mapFound: true,
      mapData: this.toString(),
      width: this.width,
      height: this.height,
    };
  }
}

module.exports = GameMap;
