import { clampLoop } from './Utility';

class UI {
  constructor(uiOptionsArr = [{ text: 'empty', onSelect: () => {} }], mode = 'menu') {
    this.mode = mode; // menu or text (input), default is menu
    this.hidden = false;
    this.textMaxLength = 16;
    this.textInput = '';
    this.textIdx = -1;
    this.newMenu(uiOptionsArr);
  }

  setMode(newMode) {
    if (newMode === 'menu' || newMode === 'text') {
      this.mode = newMode;
    }
  }

  newMenu(uiOptionsArr = [{ text: 'empty', onSelect: () => {} }], mode = 'menu') {
    // options are defined as: { text: option_text, onSelect: callback func }
    this.mode = mode;
    this.menuOptions = uiOptionsArr;
    this.selectorIdx = 0;
  }

  clear() {
    this.menuOptions = [{ text: 'empty', onSelect: () => {} }];
    this.selectorIdx = 0;
    this.textInput = '';
    this.textIdx = -1;
    this.mode = 'menu';
  }

  clearInput() {
    this.selectorIdx = 0;
    this.textInput = '';
    this.textIdx = -1;
  }

  next() {
    if (this.mode === 'menu') {
      this.selectorIdx = clampLoop(this.selectorIdx + 1, 0, this.menuOptions.length - 1);
    } else if (this.mode === 'text') {
      this.textIdx = clampLoop(this.textIdx + 1, 0, this.textInput.length - 1);
    }
  }

  prev() {
    if (this.mode === 'menu') {
      this.selectorIdx = clampLoop(this.selectorIdx - 1, 0, this.menuOptions.length - 1);
    } else if (this.mode === 'text') {
      this.textIdx = clampLoop(this.textIdx - 1, 0, this.textInput.length - 1);
    }
  }

  select() {
    this.menuOptions[this.selectorIdx].onSelect();
    // this.clear();
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

  getOptionText() {
    return this.menuOptions.map((uiOptionObj) => uiOptionObj.text);
  }

  getCurrentSelection() {
    return this.selectorIdx;
  }

  getCurrentOption() {
    return this.menuOptions[this.selectorIdx].text;
  }
}

export default UI;
