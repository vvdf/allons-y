import { clamp } from './Utility';

class Entity {
  constructor(name, textureKey, x, y, gameMap, id = 0) {
    this.id = id;
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    if (!Number.isNaN(x) && !Number.isNaN(y) && gameMap) {
      this.x = x;
      this.y = y;
      this.gameMap = gameMap;
    }
  }

  move(dx, dy) {
    this.x = clamp(this.x + dx, 0, this.gameMap.width - 1);
    this.y = clamp(this.y + dy, 0, this.gameMap.height - 1);
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

export default Entity;
