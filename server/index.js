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

// entity register
app.post('/entity', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  let clientId;
  let entityId;

  // check for existing clientId
  if (cookies.cid && clients[cookies.cid]) {
    // cid exists on cookies AND exists within local cached cid list
    clientId = cookies.cid;
  } else {
    // no cid found OR doesn't exist within cache, create and assign valid cid
    // TODO - utilize real UUID generation
    clientId = `CID${Math.floor(Math.random() * 100000).toString() + req.body.name.toUpperCase()}`;
    entityId = `EID${[...req.body.name].map((char) => char.charCodeAt(0)).reduce((val, acc) => `${val}${acc}`)}`;
    res.cookie('cid', clientId);
    console.log('NEW CID: ', clientId, ' - NEW EID: ', entityId);
    clients[clientId] = entityId;
  }

  // TODO - proper organization of entity registration, tracking, and sending within GET
  // console.log(`Registering the following Entity to Client[${clientId}]:`
  //   + `(${req.body.name}, ${req.body.x}, ${req.body.y})`);
  entities[clients[clientId]] = req.body;
  if (!req.body.x || !req.body.y) {
    // TODO - input data validation
    entities[clients[clientId]].x = 0;
    entities[clients[clientId]].y = 0;
  }
  res
    .status(201)
    .send('Entity Registered');
});

// load all entities, starting with player (will be empty if cid not found/registered)
app.get('/entity', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  const entityList = [];
  entityList.push(entities[clients[cid]]);
  Object.keys(entities).forEach((key) => {
    // console.log(`${key} ${entities[key]}`);
    if (key !== clients[cid]) {
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
  console.log('USER CONNECTED VIA SOCKET');
  socket.send('SEND ; HOWDY DOODY, CONNECTED');

  socket.emit('gameEvent', { tag: 'MOVE ENTITY Or SMTH' });

  socket.on('serverLog', (data) => {
    socket.emit('gameEvent', 'MOVE TEST');
  });
});

app.listen(REST_PORT, () => console.log(`REST API Server open, listening on ${REST_PORT}`));
server.listen(SOCK_PORT, () => console.log(`Socket server open, listening on ${SOCK_PORT}`));
