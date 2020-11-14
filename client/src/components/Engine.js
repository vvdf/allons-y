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

    this.userID = '';
    this.state = this.startGame;
    this.eventQueue = new EventQueue();
    this.entities = [];
    this.playerEntity = {};
    this.entityIdMap = {};
    this.messageLog = {}; // TODO - build a proper module handling message I/O (likely part of UI?)
    this.currentMap = 'world';
    this.gameMap = new GameMap(40, 40);
    // this.gameMap.load();
    this.input = new Input(this.eventQueue);
    this.ui = new UI();
    this.renderer = new Renderer(
      this.settings,
      this.constants,
      this.entities,
      this.gameMap,
      this.ui,
      this.messageLog,
    );
    this.flagRerender = false;
    targetEle.appendChild(this.renderer.getView());
    this.renderer.setup()
      .then(() => this.initEvents())
      .then(() => this.renderer.addToTicker((delta) => this.gameLoop(delta)));
  }

  initEvents() {
    // define events for EventQueue/Reducer
    this.eventQueue.defineEvent('MOVE_ENTITY',
      (entityId, dx = 0, dy = 0) => {
        this.entityIdMap[entityId].move(dx, dy);
        if (entityId === this.entities[1].id) {
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
        if (entityId === this.entities[1].id) {
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
        // this.renderer.animate(['ui'], 'blinkOut', 100)
        //   .then(() => this.ui.select());
        this.ui.select();
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

  startGame(delta) {
    // determine if game is loading or enters main menu
    axios.get('/client')
      .then((clientData) => {
        if (clientData.data.found) {
          // user id AND living entity found, jump to base menu
          axios.get('/entity')
            .then(({ data }) => {
              this.createEntity({ name: 'Camera', id: 0 });
              this.createEntity(data);
              this.currentMap = data.map;
              this.input.setOwner(this.entities[1]);
              this.sio = new SocketInterface(this.eventQueue, `${window.location.hostname}:3001`);
              if (data.map === 'world') {
                this.state = this.worldMap;
                // this.state = this.baseMenu;
              } else {
                this.state = this.fieldMode;
              }
            });
        } else {
          // user id not found, new user id assigned, go to main menu
          this.state = this.mainMenu;
        }
        this.userID = clientData.userID;
      });
    this.state = this.play;
  }

  mainMenu(delta) {
    this.ui.newMenu([{
      text: 'new officer',
      onSelect: () => {
        this.state = this.characterCreation;
        this.ui.clear();
      },
    }]);
    this.renderer.clear();
    this.renderer.render();
    this.state = this.play;
  }

  characterCreation(delta) {
    let playerName = '';
    let playerAreaName = '';
    this.messageLog.consoleText = '> NEW OFFICER NAME:\n> '; // initializations
    this.messageLog.consoleInput = '';
    this.renderer.consoleRender();
    this.renderer.hide('console', 'consoleText');
    this.renderer.animate(['console', 'consoleText'], 'fadeIn', 20);
    this.input.setMode('text');
    let creationStep = 0;
    this.ui.newMenu([{
      text: 'create officer',
      onSelect: () => {
        const textLines = this.messageLog.consoleText.split('\n');
        if (textLines > 24) {
          this.messageLog.consoleText = textLines.slice(textLines.length - 24).join('\n');
        }
        let nextStepPromptText = '';

        if (this.messageLog.consoleInput.length > 0) {
          // acceptable input submitted
          if (creationStep < 1) {
            playerName = this.ui.getText();
            nextStepPromptText = `AREA WHERE OFFICER [${playerName}] IS STATIONED:\n> `;
          } else if (creationStep === 1) {
            playerAreaName = this.ui.getText();
            nextStepPromptText = `WELCOME, OFFICER [${playerName}] OF THE [${playerAreaName}] `
            + `${playerName.length + playerAreaName.length > 24 ? '\n' : ''}DIVISION`;
            this.ui.clear();
            axios.post('/entity', { name: playerName, area: playerAreaName })
              .then(() => {
                axios.get('/entity')
                  .then(({ data }) => {
                    this.createEntity({ name: 'Camera', id: 0 });
                    this.createEntity(data);
                    this.currentMap = data.map;
                    this.input.setOwner(this.entities[1]);
                    this.sio = new SocketInterface(this.eventQueue, `${window.location.hostname}:3001`);
                    this.ui.clear();
                    this.ui.newMenu([{
                      text: 'start game',
                      onSelect: () => {
                        if (this.currentMap === 'world') {
                          console.log('Entering World');
                          this.state = this.worldMap;
                          // this.state = this.baseMenu;
                        } else {
                          console.log('Entering Field');
                          this.state = this.fieldMode;
                        }
                        this.ui.clear();
                      },
                    }]);
                  });
              });
          }
          creationStep += 1;
        }

        this.messageLog.consoleText = `${this.messageLog.consoleText}`
          + `${this.messageLog.consoleInput}\n> ${nextStepPromptText}`;
        this.messageLog.consoleInput = '';
        this.ui.clearInput();
      },
    }]);
    this.ui.setMode('text');
    this.state = this.play;
  }

  worldMap(delta) {
    // code to render world map before switching to base menu navigation
    // prioritized after building base menu functionality
    this.renderer.setMode('field');
    this.renderer.clear();
    this.renderer.render();
    this.renderer.hide('map', 'entities');
    this.renderer.animate(['map', 'entities'], 'fadeIn', 500);
    this.input.setMode('field');
    this.centerCamera();
    this.state = this.baseMenu;
  }

  baseMenu(delta) {
    // code to load game into base management screen
    // TODO - need to setup UI and renderer
    this.renderer.setMode('baseUI');
    // TODO - add cool scifi slide in/load animation here
    this.input.setMode('ui');
    const debugUiPrint = () => {
      console.log(this.ui.getCurrentOption());
    };
    this.ui.newMenu([{ text: 'deploy', onSelect: () => { debugUiPrint(); } },
      { text: 'case files', onSelect: () => { debugUiPrint(); } },
      { text: 'personnel', onSelect: () => { debugUiPrint(); } },
      { text: 'r&d', onSelect: () => { debugUiPrint(); } },
      { text: 'armory', onSelect: () => { debugUiPrint(); } },
      { text: 'cafeteria', onSelect: () => { debugUiPrint(); } },
    ]);
    this.renderer.render();
    this.renderer.hide('ui');
    this.renderer.animate(['ui'], 'fadeIn', 50);
    this.state = this.play;
    // TODO - expand UI OPTION to have both text AND response callback
  }

  fieldMode(delta) {
    // code to load game into field
    // TODO - build code to load field content including potential other players
    // ALSO build code to facilitate multiplayer content
    // determine which multiplayer system to use for a turn based active game
  }

  // ----------------------------------
  // engine helper methods
  // ----------------------------------
  createEntity({
    name = 'Generic Entity',
    textureKey = 'blank',
    x = 0,
    y = 0,
    id = 1,
  }) {
    const createdEntity = new Entity(name, textureKey, x, y, this.gameMap, id);
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
