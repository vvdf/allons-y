class Entity {
  constructor(eid, name, textureKey) {
    this.eid = eid;
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = { x: 0, y: 0, blocking: textureKey !== 'blank' && textureKey !== 'highlight' };
  }

  move(dx, dy) {
    this.pos.x += dx;
    this.pos.y += dy;
  }

  setTint(colorValue) {
    this.tint = colorValue;
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  setPosObj({ x, y }) {
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

  hasAction() {
    return !!this.actionList;
  }

  addAction(text) {
    console.log('attempting to add action');
    if (!this.hasAction()) {
      console.log('creating blank action list table');
      this.actionList = [];
    }
    console.log('adding to action list table');
    this.actionList.push(text);
  }

  removeAction() {
    this.actionList.pop();
  }

  getActions() {
    console.log('get actions called');
    console.log(this.actionList);
    return this.hasAction() ? this.actionList.slice() : [];
  }
}

export default Entity;
