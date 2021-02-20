class Input {
  constructor(targetEventQueue, ownerEntity) {
    this.eventQueue = targetEventQueue;
    this.owner = ownerEntity;
    this.mode = 'ui'; // ui menu, text (input), combat or field
    this.key = {};
    this.keyMap = {};
    this.init();
  }

  init() {
    // assign keys to functions
    this.registerKeys();
    this.mapKeys();

    // initialize key listener
    window.addEventListener('keydown', ({ keyCode }) => {
      if ({}.hasOwnProperty.call(this.keyMap[this.mode], keyCode)) {
        this.sendEvent(this.keyMap[this.mode][keyCode]);
      } else {
        // unlisted key for given mode
        console.log(`Unassigned Key Pressed / KEY CODE: ${keyCode} / INPUT MODE: ${this.mode}`);
      }
    }, false);
  }

  setMode(newMode) {
    if (newMode === 'ui' || newMode === 'text' || newMode === 'field') {
      this.mode = newMode;
    }
  }

  registerKeys() {
    // TODO - refactor to allow this to check for custom key assignments in user profile
    // TODO - allow double assignments/double checks, for example numpad numbers + reg numbers
    // key assignments
    this.key.moveUp = '38'; // arrow up
    this.key.moveDown = '40'; // arrow down
    this.key.moveLeft = '37'; // arrow left
    this.key.moveRight = '39'; // arrow right
    this.key.select = '13'; // enter
    this.key.back = '8'; // backspace
    this.key.space = '32'; // space
    this.key.minus = '173'; // minus
    this.key.key1 = '49';
    this.key.key2 = '50';
    this.key.key3 = '51';
    this.key.key4 = '52';
    this.key.num1 = '97';
    this.key.num2 = '98';
    this.key.num3 = '99';
    this.key.num4 = '100';

    // debug key assignments
    this.key.refresh = '192'; // tilde
    this.key.toggleUI = '85'; // 'U'
    this.key.debugPrint = '32';

    for (let i = 0; i < 26; i += 1) {
      this.key[String.fromCharCode(97 + i)] = 65 + i;
    }
  }

  mapKeys() {
    // ui menu mappings
    this.keyMap.ui = {};
    this.keyMap.ui[this.key.moveUp] = { signal: 'UI_SELECT', params: [1] };
    this.keyMap.ui[this.key.moveDown] = { signal: 'UI_SELECT', params: [2] };
    this.keyMap.ui[this.key.moveLeft] = { signal: 'UI_SELECT', params: [3] };
    this.keyMap.ui[this.key.moveRight] = { signal: 'UI_SELECT', params: [4] };
    this.keyMap.ui[this.key.select] = { signal: 'UI_SELECT', params: [0] };

    // text input controls
    this.keyMap.text = {};
    this.keyMap.text[this.key.moveLeft] = { signal: 'UI_INPUT', params: [1] };
    this.keyMap.text[this.key.moveRight] = { signal: 'UI_INPUT', params: [2] };
    this.keyMap.text[this.key.select] = { signal: 'UI_INPUT', params: [0] };
    this.keyMap.text[this.key.back] = { signal: 'UI_INPUT', params: [-1] };
    this.keyMap.text[this.key.space] = { signal: 'UI_INPUT', params: [' '] };
    this.keyMap.text[this.key.minus] = { signal: 'UI_INPUT', params: ['-'] };
    for (let i = 0; i < 26; i += 1) {
      const char = String.fromCharCode(97 + i);
      this.keyMap.text[this.key[char]] = { signal: 'UI_INPUT', params: [char] };
    }

    // field key mapping, only allow if an owner entity is set
    if (this.owner) {
      this.keyMap.field = {};
      // player actions
      this.keyMap.field[this.key.moveUp] = { signal: 'MOVE_ENTITY', params: [this.owner.eid, 0, -1] };
      this.keyMap.field[this.key.moveDown] = { signal: 'MOVE_ENTITY', params: [this.owner.eid, 0, 1] };
      this.keyMap.field[this.key.moveLeft] = { signal: 'MOVE_ENTITY', params: [this.owner.eid, -1, 0] };
      this.keyMap.field[this.key.moveRight] = { signal: 'MOVE_ENTITY', params: [this.owner.eid, 1, 0] };

      this.keyMap.field[this.key.toggleUI] = { signal: 'TOGGLE_UI', params: [] };

      this.keyMap.field[this.key.key1] = { signal: 'SHOW_RANGE', params: [3] };

      // debug field key mapping
      this.keyMap.field[this.key.refresh] = { signal: 'RERENDER', params: ['full'] };
      this.keyMap.field[this.key.debugPrint] = { signal: 'DEBUG_MSG', params: [''] };
    }
  }

  sendEvent(event) {
    this.eventQueue.enqueue(event);
  }

  setOwner(ownerEntity) {
    this.owner = ownerEntity;
    this.mapKeys(); // refresh key mappings to factor in owner entity
  }
}

export default Input;
