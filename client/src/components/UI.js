import { clamp } from './Utility';

class UI {
  constructor(uiSelectionsArr = [() => {}]) {
    this.mode = 'menu'; // menu or text (input)
    this.textMaxLength = 24;
    this.textInput = '';
    this.textIdx = -1;
    this.newMenu(uiSelectionsArr);
  }

  setMode(newMode) {
    if (newMode === 'menu' || newMode === 'text') {
      this.mode = newMode;
    }
  }

  clear() {
    this.menuOptions = [() => {}];
    this.selectorIdx = 0;
    this.textInput = '';
    this.textIdx = -1;
    this.mode = 'menu';
  }

  newMenu(uiSelectionsArr) {
    this.menuOptions = uiSelectionsArr;
    this.selectorIdx = 0;
  }

  next() {
    if (this.mode === 'menu') {
      this.selectorIdx = clamp(this.selectorIdx + 1, 0, this.menuOptions.length - 1);
    } else if (this.mode === 'text') {
      this.textIdx = clamp(this.textIdx + 1, 0, this.textInput.length - 1);
    }
  }

  prev() {
    if (this.mode === 'menu') {
      this.selectorIdx = clamp(this.selectorIdx - 1, 0, this.menuOptions.length - 1);
    } else if (this.mode === 'text') {
      this.textIdx = clamp(this.textIdx - 1, 0, this.textInput.length - 1);
    }
  }

  select() {
    this.menuOptions[this.selectorIdx]();
    this.clear();
  }

  delete() {
    if (this.mode === 'text') {
      this.textInput = `${this.textInput.slice(0, this.textIdx)}${this.textInput.slice(this.textIdx + 1)}`;
      this.prev();
    }
  }

  add(char) {
    if (this.mode === 'text' && this.textInput.length < this.textMaxLength) {
      this.textInput = `${this.textInput}${char}`;
      this.next();
    }
  }

  getText() {
    return this.textInput;
  }
}

export default UI;
