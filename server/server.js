const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { parseCookies } = require('./utility');

const REST_PORT = 3000;
const SOCK_PORT = 3001;
app.use(express.json());

// client id : entity id map
// TODO - to be reformatted into DBMS
const clients = {};
const mapCache = {};
const entities = {};

app.use('/', express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/registerClient', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  const clientId = cid || `CID${Math.random().toString(36).substring(6)}`;
  res.cookie('cid', clientId).status(200).send('CID attached in cookie');
});

// load all entities, starting with player (will be empty if cid not found/registered)
app.get('/entity', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  const entityList = [];
  if (cid && clients[cid] && clients[cid].eid) {
    // player character found, add to start of entity list
    entityList.push(entities[clients[cid].eid]);
  } else {
    // no player character OR no cid found, create and send one
    // TODO - build real generator functions for server
    const name = `Apron${Math.random().toString(36).substring(6)}`;
    const entityId = `EID${name.toUpperCase() + Math.random().toString(36).substring(6)}`;
    const playerEntityBase = {
      id: entityId,
      name,
      textureKey: 'player',
      x: 0,
      y: 0,
      gameMap: 0,
    };
    entityList.push(playerEntityBase);
    entities[entityId] = playerEntityBase;
    clients[cid] = { eid: entityId };
  }
  Object.keys(entities).forEach((key) => {
    if (key !== clients[cid].eid) {
      entityList.push(entities[key]);
    }
  });
  res.status(200).send(entityList);
});

// map saving
app.post('/map', (req, res) => {
  console.log(`Saving Map, "${req.body.name}"`);
  // save to cache
  mapCache[req.body.name] = req.body.grid;

  // save to file
  fs.writeFile(path.join(__dirname, '..', 'maps', `${req.body.name}.map`),
    req.body.grid, () => {
      res.status(201).send('Map Successfully Saved');
    });
});

// map loading
app.get('/map/:mapName', (req, res) => {
  console.log(`Loading Map, "${req.params.mapName}"`);
  if (mapCache[req.params.mapName]) {
    // load from cache if available
    res.status(200).send({ mapFound: true, mapData: mapCache[req.params.mapName] });
  } else {
    // otherwise, load from file
    fs.readFile(path.join(__dirname, '..', 'maps', `${req.params.mapName}.map`), 'utf8',
      (err, data) => {
        if (err) {
          console.log(err);
          res.status(200).send({ mapFound: false });
        } else {
          res.status(200).send({ mapFound: true, mapData: data });
        }
      });
  }
});

io.on('connection', (socket) => {
  let clientId;
  let entityId;

  socket.on('register', ({ cookie }) => {
    console.log('REGISTER DATA RECEIVED: ', cookie);
    clientId = parseCookies(cookie).cid;

    // TODO - generate a clientId if one doesn't exist
    if (clientId && clients[clientId] && clients[clientId].eid) {
      console.log('CLIENT ID FOUND, attached EID = ', clients[clientId].eid);
      entityId = clients[clientId].eid;
      const {
        name, textureKey, x, y, gameMap, id,
      } = entities[entityId];

      clients[clientId].sid = socket.id;
      io.to(clients[clientId].sid).emit('gameEvent', { signal: 'DEBUG_MSG', params: ['SID REGISTERED'] });
      socket.to('/').emit('gameEvent', { signal: 'NEW_ENTITY', params: [name, textureKey, x, y, gameMap, id] });
    } else {
      // TODO - signal to reregister for a client ID
      // NOTE - io.to broadcasts from server, socket.to broadcasts from (and not back to) sender
    }
  });

  socket.on('gameEvent', (data) => {
    if (data.signal === 'MOVE_ENTITY' ** entityId) {
      entities[entityId].x += data.params[1];
      entities[entityId].y += data.params[2];
    }
    socket.to('/').emit('gameEvent', data);
  });
});

app.listen(REST_PORT, () => console.log(`REST API Server open, listening on ${REST_PORT}`));
server.listen(SOCK_PORT, () => console.log(`Socket server open, listening on ${SOCK_PORT}`));
