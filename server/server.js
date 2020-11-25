const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const GameMap = require('./GameMap');
const { parseCookies } = require('./utility');

const REST_PORT = 3000;
const SOCK_PORT = 3001;
app.use(express.json());

// client id : entity id map
// TODO - to be reformatted into DBMS
// TODO - refactor for UserID and SessionID management once a proper
//   login/register interface is implemented on the front end
// TODO - build character, uid, etc generation utility methods
const clients = {};
const guilds = {}; // comprised of Seed, PlayerEntities, OpenMaps, progression info
const mapCache = {};
const entities = {};

app.use('/', express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/client', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  const clientId = cid || `CID${Math.random().toString(36).substring(6)}`;
  console.log(clientId, Object.keys(clients));
  if (clients[clientId]) {
    console.log(clients[clientId]);
  }
  const responseData = {
    found: {}.hasOwnProperty.call(clients, clientId) // ret true if client exists
      && {}.hasOwnProperty.call(clients[clientId], 'eid'), // AND client has entity
    userID: clientId,
  };
  res.cookie('cid', clientId).status(200).send(responseData);
});

app.post('/entity', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  const { name, area } = req.body;
  console.log('REGISTERING NEW ENTITY FOR CLIENT: ', cid);
  const eid = `EID${req.body.name.toUpperCase() + Math.random().toString(36).substring(6)}`;
  const playerEntity = {
    id: eid,
    name,
    textureKey: 'player',
    x: 0,
    y: 0,
    map: 'world',
    guild: area, // TODO - edit to use guild name gen
  };

  if (!{}.hasOwnProperty.call(guilds, area)) {
    // if the guild has yet to be established, create
    guilds[area] = {
      name: area, // TODO - edit like above to use guild name gen
      entities: [],
      maps: {},
      stats: {},
    };
  }

  if (!{}.hasOwnProperty.call(clients, cid)) {
    clients[cid] = {};
  }

  clients[cid].eid = eid;
  clients[cid].area = area;
  entities[eid] = playerEntity;
  guilds[area].entities.push(playerEntity);
  console.log(clients);
  res.status(200).send();
});

// load all entities, starting with player (will be empty if cid not found/registered)
app.get('/entity', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  // TODO - read map of current entity and return list of all visible entities
  res.status(200).send(entities[clients[cid].eid]);
  // const entityList = [];
  // if (cid && clients[cid] && clients[cid].eid) {
  //   // player character found, add to start of entity list
  //   entityList.push(entities[clients[cid].eid]);
  // } else {
  //   // no player character OR no cid found, create and send one
  //   // TODO - build real generator functions for server
  //   const name = `Apron${Math.random().toString(36).substring(6)}`;
  //   const entityId = `EID${name.toUpperCase() + Math.random().toString(36).substring(6)}`;
  //   const playerEntityBase = {
  //     id: entityId,
  //     name,
  //     textureKey: 'player',
  //     x: 0,
  //     y: 0,
  //     gameMap: 0,
  //   };
  //   entityList.push(playerEntityBase);
  //   entities[entityId] = playerEntityBase;
  //   clients[cid] = { eid: entityId };
  // }
  // Object.keys(entities).forEach((key) => {
  //   if (key !== clients[cid].eid) {
  //     entityList.push(entities[key]);
  //   }
  // });
  // res.status(200).send(entityList);
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
    console.log(`Loaded Map, "${req.params.mapName}"`);
    res.status(200).send({ mapFound: true, mapData: mapCache[req.params.mapName] });
  } else {
    // otherwise, load from file TODO changed to generate
    // fs.readFile(path.join(__dirname, '..', 'maps', `${req.params.mapName}.map`), 'utf8',
    //   (err, data) => {
    //     if (err) {
    //       console.log(err);
    //       res.status(200).send({ mapFound: false });
    //     } else {
    //       res.status(200).send({ mapFound: true, mapData: data });
    //     }
    //   });
    console.log(`Generating Map, "${req.params.mapName}"`);
    const mapData = new GameMap();
    mapData.generate('rogue', ',', '~');
    res.status(200).send({
      mapFound: true,
      mapData: mapData.toString(),
      width: mapData.width,
      height: mapData.height,
      spawn: mapData.spawn,
    });
    console.log(mapData.spawn);
  }
});

io.on('connection', (socket) => {
  let clientId;
  let entityId;

  socket.on('register', ({ cookie }) => {
    console.log('REGISTER DATA RECEIVED: ', cookie);
    clientId = parseCookies(cookie).cid;
    socket.join('root');

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
    // TODO refactor move_entity handling to only allow and pass on legal movements
    // AND proper handling of rooms for instanced maps between players
    // TODO refactor signal responses into a response hashmap/object for ease of use/speed
    if (data.signal === 'MOVE_ENTITY' && entityId) {
      entities[entityId].x += data.params[1];
      entities[entityId].y += data.params[2];
    }
    socket.to('root').emit('gameEvent', data);
  });
});

app.listen(REST_PORT, () => console.log(`REST API Server open, listening on ${REST_PORT}`));
server.listen(SOCK_PORT, () => console.log(`Socket server open, listening on ${SOCK_PORT}`));
