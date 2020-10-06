import { clamp } from './Utility';

class UI {
  constructor(uiSelectionsArr = [() => {}]) {
    this.newMenu(uiSelectionsArr);
  }

  newMenu(uiSelectionsArr) {
    this.menuOptions = uiSelectionsArr;
    this.selectorIdx = 0;
  }

  next() {
    this.selectorIdx = clamp(this.selectorIdx + 1, 0, this.menuOptions.length - 1);
  }

  prev() {
    this.selectorIdx = clamp(this.selectorIdx - 1, 0, this.menuOptions.length - 1);
  }

  select() {
    this.menuOptions[this.selectorIdx]();
  }
}

export default UI;
