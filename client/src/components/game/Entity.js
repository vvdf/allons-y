class Entity {
  constructor(name, textureKey, x, y, id) {
    this.id = id;
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = { x: 0, y: 0 };
  }

  move(dx, dy) {
    this.pos.x += dx;
    this.pos.y += dy;
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  nextPos(dx, dy) {
    return { x: this.pos.x + dx, y: this.pos.y + dy };
  }

  equalsPos({ x, y }) {
    return this.pos.x === x && this.pos.y === y;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

export default Entity;
