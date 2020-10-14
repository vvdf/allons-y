import axios from 'axios';
import GameMap from './GameMap';
import Entity from './Entity';
import Input from './Input';
import EventQueue from './EventQueue';
import Renderer from './Renderer';
import SocketInterface from './SocketInterface';
import UI from './UI';

class Engine {
  constructor(targetEle) {
    // initialize game renderer, append as child to passed in element
    this.settings = {
      backgroundColor: 0x030305,
      width: 800,
      height: 550,
      resolution: 1,
    };

    this.constants = {
      // these include pixel overlap
      tileWidth: 28,
      tileHeight: 14,
      tileDepth: 10,
    };

    this.playerName = '';
    this.playerAreaName = '';
    this.playerEntityId = 1;
    this.state = this.mainMenu;
    this.eventQueue = new EventQueue();
    this.entities = [];
    this.playerEntity = {};
    this.entityIdMap = {};
    this.messageLog = {}; // TODO - build a proper module for handling message in/out
    this.gameMap = new GameMap(40, 40, 'g');
    // this.gameMap.load();
    this.input = new Input(this.eventQueue);
    this.ui = new UI();
    this.renderer = new Renderer(
      this.settings,
      this.constants,
      this.entities,
      this.gameMap,
      this.messageLog,
    );
    this.flagRerender = false;
    targetEle.appendChild(this.renderer.getView());
    this.renderer.setup()
      .then(() => this.initEvents());
    this.renderer.addToTicker((delta) => this.gameLoop(delta));
  }

  initEvents() {
    // define events for EventQueue/Reducer
    this.eventQueue.defineEvent('MOVE_ENTITY',
      (entityId, dx = 0, dy = 0) => {
        this.entityIdMap[entityId].move(dx, dy);
        if (entityId === this.playerEntityId) {
          // if entity moved is player, move camera also
          this.entityIdMap[0].move(dx, dy);
          this.sio.emit('gameEvent', { signal: 'MOVE_ENTITY', params: [entityId, dx, dy] });
        }
      });

    this.eventQueue.defineEvent('NEW_ENTITY',
      (name, textureKey, x, y, gameMap, id) => {
        if (this.entityIdMap[id]) {
          // if entity still exists in local storage
          this.entityIdMap[id].setPos(x, y);
        } else {
          // otherwise add new entity
          this.createEntity({
            name, textureKey, x, y, gameMap, id,
          });
          this.flagRerender = true;
        }
      });

    this.eventQueue.defineEvent('PAINT_MAP',
      (entityId, tile) => {
        this.gameMap.set(this.entityIdMap[entityId].x, this.entityIdMap[entityId].y, tile);
        if (entityId === this.playerEntityId) {
          // only emit signal if you're the creator of it
          this.sio.emit('gameEvent', { signal: 'PAINT_MAP', params: [entityId, tile] });
        }
        this.sio.emit('gameEvent', { signal: 'RERENDER', params: [] });
        this.flagRerender = true;
      });

    this.eventQueue.defineEvent('RERENDER', () => { this.flagRerender = true; });
    this.eventQueue.defineEvent('DEBUG_MSG', (msg) => { console.log(msg); });

    this.eventQueue.defineEvent('UI_SELECT', (input) => {
      if (input === 2) {
        this.ui.next();
      } else if (input === 1) {
        this.ui.prev();
      } else {
        this.renderer.animate(['ui'], 'blinkOut', 100)
          .then(() => this.ui.select());
      }
    });

    this.eventQueue.defineEvent('UI_INPUT', (input) => {
      if (typeof input === 'string') {
        this.ui.add(input);
        this.messageLog.consoleInput = this.ui.getText();
      } else if (input === 1) {
        this.ui.prev();
      } else if (input === 2) {
        this.ui.next();
      } else if (input === -1) {
        this.ui.delete();
        this.messageLog.consoleInput = this.ui.getText();
      } else {
        this.ui.select();
      }
    });
  }

  initGame() {
    // TODO - possibly build a state change/clear function?
    // initialize game Engine variables/systems/assets

    // create game camera as focus entity
    this.createEntity({
      name: 'Camera',
      textureKey: 'blank',
      gameMap: this.gameMap,
      id: 0,
    });

    // TODO -- submit a character creation request to server to register character and location
    // then assign to a guild/create guild if necessary

    // change this to POST request with character name/location
    axios.get('/registerClient')
      .then(() => axios.get('/entity'))
      .then((response) => {
        console.log('TOTAL ENTITIES RECEIVED: ', response.data.length);
        for (let i = 0; i < response.data.length; i += 1) {
          this.createEntity(response.data[i]);
        }
        this.playerEntityId = this.entities[1].id;
        this.input.setOwner(this.entities[1]);
      })
      .then(() => {
        // initialize game loop and perform first render
        // after initialization of player/camera/etc
        this.centerCamera(false);

        // initialize socket interface only after GET call occurs which
        // should guarantee a CID cookie
        const {
          name, textureKey, x, y, gameMap, id,
        } = this.entities[1];
        this.sio = new SocketInterface(this.eventQueue, `${window.location.hostname}:3001`);
        this.sio.emitOnConnect('gameEvent', { signal: 'NEW_ENTITY', params: [name, textureKey, x, y, gameMap, id] });
      });
  }

  gameLoop(delta) {
    this.state(delta);
  }

  // ----------------------------------
  // game states
  // ----------------------------------
  play(delta) {
    // play state function
    if (this.eventQueue.length > 0) {
      this.eventQueue.next(delta);
      // console.log('EVENT COUNT: ', this.eventQueue.length);
      if (this.eventQueue.length < 1) {
        // if event queue is emptied, ie all potential state change is computed, re-render
        if (this.flagRerender) {
          this.renderer.render();
        } else {
          this.renderer.update();
        }
      }
    }
  }

  mainMenu(delta) {
    this.renderer.clear();
    this.renderer.render();
    this.ui.newMenu([() => {
      this.state = this.characterCreation;
      this.ui.clear();
    }]);
    this.state = this.play;
  }

  characterCreation(delta) {
    this.messageLog.consoleText = '> NEW OFFICER NAME:\n> '; // initializations
    this.messageLog.consoleInput = '';
    this.renderer.renderConsole();
    this.input.setMode('text');
    let creationStep = 0;
    this.ui.newMenu([() => {
      const textLines = this.messageLog.consoleText.split('\n');
      if (textLines > 24) {
        this.messageLog.consoleText = textLines.slice(textLines.length - 24).join('\n');
      }
      let nextStepPromptText = '';

      if (this.messageLog.consoleInput.length > 0) {
        // acceptable input submitted
        if (creationStep < 1) {
          this.playerName = this.ui.getText();
          nextStepPromptText = `AREA WHERE OFFICER [${this.playerName}] IS STATIONED:\n> `;
        } else if (creationStep === 1) {
          this.playerAreaName = this.ui.getText();
          nextStepPromptText = `WELCOME, OFFICER [${this.playerName}] OF THE [${this.playerAreaName}] `
          + `${this.playerName.length + this.playerAreaName.length > 24 ? '\n' : ''}DIVISION`;
          this.ui.clear();
          // initGame();
          // this.state = this.openMenu;
        }
        creationStep += 1;
      }

      this.messageLog.consoleText = `${this.messageLog.consoleText}`
        + `${this.messageLog.consoleInput}\n> ${nextStepPromptText}`;
      this.messageLog.consoleInput = '';
      this.ui.clearInput();
    }]);
    this.ui.setMode('text');
    this.state = this.play;
  }

  baseMenu(delta) {
    // code to load game into base management screen
  }

  // ----------------------------------
  // engine helper methods
  // ----------------------------------
  createEntity({
    name = 'Generic Entity',
    textureKey = 'blank',
    x = 0,
    y = 0,
    gameMap = this.gameMap,
    id = 1,
  }) {
    const createdEntity = new Entity(name, textureKey, x, y, this.gameMap, id);
    this.renderer.updateEntitySprite(id, textureKey);
    this.entities.push(createdEntity);
    this.entityIdMap[id] = createdEntity;
  }

  centerCamera(updateView = true) {
    this.entities[0].setPos(this.entities[1].x, this.entities[1].y);
    if (updateView) {
      this.renderer.update();
    }
  }
}

export default Engine;
