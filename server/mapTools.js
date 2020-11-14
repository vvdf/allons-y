const mapToString = (map2dArr) => {
  let result = '';
  for (let i = 0; i < map2dArr.length; i += 1) {
    for (let j = 0; j < map2dArr[0].length; j += 1) {
      result += map2dArr[i][j];
    }
    result += '\n';
  }
  return result;
};

const isInBounds = (map2dArr, x, y) => x >= 0 && x < map2dArr[0].length
  && y >= 0 && y < map2dArr.length;

const exploreAndPaint = (map2dArr, walkable, brush, x, y) => {
  map2dArr[y][x] = brush;
  // explore right, left, down, up
  if (isInBounds(map2dArr, x + 1, y) && map2dArr[y][x + 1] === walkable) {
    exploreAndPaint(map2dArr, walkable, brush, x + 1, y);
  }
  if (isInBounds(map2dArr, x - 1, y) && map2dArr[y][x - 1] === walkable) {
    exploreAndPaint(map2dArr, walkable, brush, x - 1, y);
  }
  if (isInBounds(map2dArr, x, y + 1) && map2dArr[y + 1][x] === walkable) {
    exploreAndPaint(map2dArr, walkable, brush, x, y + 1);
  }
  if (isInBounds(map2dArr, x, y - 1) && map2dArr[y - 1][x] === walkable) {
    exploreAndPaint(map2dArr, walkable, brush, x, y - 1);
  }
};

const findFirst = (map2dArr, target) => {
  for (let i = 0; i < map2dArr.length; i += 1) {
    for (let j = 0; j < map2dArr[0].length; j += 1) {
      if (map2dArr[i][j] === target) {
        return { x: j, y: i, exists: true };
      }
    }
  }
  return { exists: false };
};

const findNearest = (map2dArr, target, x, y) => {
  const result = {
    x,
    y,
  };

  let delta = Infinity;

  for (let i = 0; i < map2dArr.length; i += 1) {
    for (let j = 0; j < map2dArr[0].length; j += 1) {
      if (map2dArr[i][j] === target) {
        const deltaX = Math.abs(x - j);
        const deltaY = Math.abs(y - i);
        if (deltaX + deltaY < delta) {
          delta = deltaX + deltaY;
          result.x = j;
          result.y = i;
        }
      }
    }
  }
  return result;
};

const copyMap = (map2dArr, replacerDictObj) => {
  // build a map based on an input map, with an object to represent
  // a dictionary of items to replace ie { '#': 0 } will replace #s with 0s
  // take a special replacer key of 'everythingElse'
  const newMap = [];

  for (let i = 0; i < map2dArr.length; i += 1) {
    const newArr = [];
    for (let j = 0; j < map2dArr[0].length; j += 1) {
      if ({}.hasOwnProperty.call(replacerDictObj, map2dArr[i][j])) {
        newArr.push(replacerDictObj[map2dArr[i][j]]);
      } else if ({}.hasOwnProperty.call(replacerDictObj, 'everythingElse')) {
        newArr.push(replacerDictObj.everythingElse);
      } else {
        newArr.push(map2dArr[i][j]);
      }
    }
    newMap.push(newArr);
  }
  return newMap;
};

module.exports = {
  mapToString,
  isInBounds,
  exploreAndPaint,
  findFirst,
  findNearest,
  copyMap,
};
