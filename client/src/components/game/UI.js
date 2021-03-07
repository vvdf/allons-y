import { clampLoop } from './Utility';

class UI {
  constructor(uiOptionsArr = [{ text: 'empty', onSelect: () => {} }], mode = 'menu') {
    this.mode = mode; // menu or text (input), default is menu
    this.hidden = false;
    this.textMaxLength = 16;
    this.textInput = '';
    this.textIdx = -1;
    this.fieldSelection = 0; // selector for field options such as actions
    this.printDebug = false;
    this.newMenu(uiOptionsArr);
  }

  setMode(newMode) {
    if (newMode === 'menu' || newMode === 'text' || newMode === 'field') {
      this.mode = newMode;
    }
  }

  newMenu(uiOptionsArr = [{ text: 'empty', onSelect: () => {} }], mode = 'menu') {
    // options are defined as: { text: option_text, onSelect: callback func }
    this.mode = mode;
    this.menuOptions = uiOptionsArr;
    this.selectorIdx = 0;
  }

  clear(inclMode = true) {
    console.log('clear called');
    this.menuOptions = [{ text: 'empty', onSelect: () => {} }];
    this.selectorIdx = 0;
    this.textInput = '';
    this.textIdx = -1;
    this.fieldSelection = 0;
    this.mode = inclMode ? 'menu' : this.mode;
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
    // select from available menu ui options
    this.menuOptions[this.selectorIdx].onSelect();
    // this.clear();
  }

  fieldSelect(actionIdx) {
    // 0 = nothing selected, 1+ = available player actions
    if (this.mode === 'field') {
      this.fieldSelection = actionIdx;
    }
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

  toggleDebug() {
    this.printDebug = !this.printDebug;
  }
}

export default UI;
