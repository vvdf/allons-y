import { Sprite, AnimatedSprite } from 'pixi.js';
import { clamp } from './Utility';

class Entity {
  constructor(name, textures, x, y, map) {
    this.name = name;
    if (!Number.isNaN(x) && !Number.isNaN(y) && map) {
      this.x = x;
      this.y = y;
      this.map = map;
      this.visible = false;
    }

    if (Array.isArray(textures)) {
      this.animatedSprite = new AnimatedSprite(textures);
    } else if (textures) {
      this.sprite = new Sprite(textures);
    }
  }

  move(dx, dy) {
    this.x = clamp(this.x + dx, 0, this.map.width - 1);
    this.y = clamp(this.y + dy, 0, this.map.height - 1);
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
