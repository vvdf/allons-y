import axios from 'axios';
import GameMap from './GameMap';
import Entity from './Entity';
import Input from './Input';
import EventQueue from './EventQueue';
import Renderer from './Renderer';
import SocketInterface from './SocketInterface';

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

    this.playerEntityId = 1;
    this.state = this.mainMenuStart;
    this.eventQueue = new EventQueue();
    this.entities = [];
    this.entityIdMap = {};
    this.gameMap = new GameMap(40, 40, 'w');
    this.gameMap.load();
    this.input = new Input(this.eventQueue);
    this.renderer = new Renderer(this.settings, this.constants, this.entities, this.gameMap);
    this.flagRerender = false;
    targetEle.appendChild(this.renderer.getView());
    this.renderer.setup()
      .then(() => this.init());
  }

  init() {
    // initialize game Engine variables/systems/assets

    // create game camera as focus entity
    this.createEntity({
      name: 'Camera',
      textureKey: 'blank',
      gameMap: this.gameMap,
      id: 0,
    });
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
        this.renderer.addToTicker((delta) => this.gameLoop(delta));

        // initialize socket interface only after GET call occurs which
        // should guarantee a CID cookie
        const {
          name, textureKey, x, y, gameMap, id,
        } = this.entities[1];
        this.sio = new SocketInterface(this.eventQueue, `${window.location.hostname}:3001`);
        this.sio.emitOnConnect('gameEvent', { signal: 'NEW_ENTITY', params: [name, textureKey, x, y, gameMap, id] });
      });

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
  }

  gameLoop(delta) {
    this.state(delta);
  }

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

  mainMenuStart(delta) {
    this.renderer.renderClearScreen();
    this.renderer.renderMainUI();
    this.state = this.mainMenuSelect;
  }

  mainMenuSelect(delta) {

  }

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
