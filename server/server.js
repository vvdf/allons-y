const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Engine = require('./Engine');
const { parseCookies, generateID } = require('./utility');

const REST_PORT = 3000;
const SOCK_PORT = 3001;
app.use(express.json());

// client id : entity id map
// TODO - to be reformatted into DBMS
// TODO - refactor for UserID and SessionID management once a proper
//   login/register interface is implemented on the front end
// TODO - build character, uid, etc generation utility methods
const clients = {}; // comprised of client[cid] -> eid, entityObj, guildObj
const guilds = {}; // comprised of Seed, PlayerEntities, OpenMaps, progression info

app.use('/', express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/client', (req, res) => {
  // creates client ID cookie if one doesn't exist
  // returns found === true if clientID is active, aka has a corresp. entityID
  const { cid } = parseCookies(req.headers.cookie);
  const clientId = cid || `CID${generateID()}`;
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
  // create entity (and guild if one doesn't exist) based on submitted name/locale
  const { cid } = parseCookies(req.headers.cookie);
  const { name, area } = req.body;
  if (!{}.hasOwnProperty.call(guilds, area)) {
    // if the guild has yet to be established, create
    Engine.newGuild(area);
    // guilds[area] = new Guild(area);
  }

  if (!{}.hasOwnProperty.call(clients, cid)) {
    // if cid not yet registered, instantiate to handle member properties
    clients[cid] = {};
  }
  clients[cid].entity = guilds[area].newMember(name);
  clients[cid].eid = clients[cid].entity.eid;
  clients[cid].guild = guilds[area];
  console.log(`REGISTERING EID${clients[cid].eid} for CID${cid}`);
  res.status(200).send();
});

// load all entities, starting with player (will be empty if cid not found/registered)
app.get('/entity', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  res.status(200).send(clients[cid].entity);
});

// map loading
app.get('/map', (req, res) => {
  const { cid } = parseCookies(req.headers.cookie);
  console.log('Loading map for', cid);

  if ({}.hasOwnProperty.call(clients, cid) && {}.hasOwnProperty.call(clients[cid], 'eid')) {
    const { eid } = clients[cid];
    // cid and eid exist, so check for map
    if (!clients[cid].entity.hasMap()) {
      // no map found, generate
      console.log('No map found for entity, generating...');
      clients[cid].guild.newMap(eid);
    }
    res.status(200).send(clients[cid].guild.getMapObj(eid));
  } else {
    res.status(400).send({ mapFound: false });
  }
});

io.on('connection', (socket) => {
  let cid;

  socket.on('register', ({ cookie }) => {
    console.log('REGISTER DATA RECEIVED: ', cookie);
    cid = parseCookies(cookie).cid;
    socket.join('root');

    // TODO - generate a clientId if one doesn't exist
    if (cid && clients[cid] && clients[cid].eid) {
      console.log('CLIENT ID FOUND, attached EID = ', clients[cid].eid);
      const { eid, name, textureKey, pos } = clients[cid].entity;

      clients[cid].sid = socket.id;
      io.to(clients[cid].sid).emit('gameEvent', {
        signal: 'DEBUG_MSG',
        params: ['SID REGISTERED'],
      });
      socket.to('/').emit('gameEvent', {
        signal: 'NEW_ENTITY',
        params: [eid, name, textureKey, pos],
      });
    } else {
      // TODO - signal to reregister for a client ID
      // NOTE - io.to broadcasts from server,
      //  socket.to broadcasts from (and not back to) sender
    }
  });

  socket.on('gameEvent', (data) => {
    if (data.signal === 'INIT_MAP' && clients[cid] && clients[cid].eid) {
      // get map and pass back each entity that isn't their own
      const npcs = clients[cid].guild.getMap(clients[cid].eid).getEntities();
      for (let i = 0; i < npcs.length; i += 1) {
        if (npcs[i].eid !== clients[cid].eid) {
          const { eid, name, textureKey, pos } = npcs[i];
          console.log('Sending new entity', eid, name, pos);
          io.to('root').emit('gameEvent', {
            signal: 'NEW_ENTITY',
            params: [eid, name, textureKey, { x: pos.x, y: pos.y }],
          });
        }
      }
    }

    if (data.signal === 'MOVE_ENTITY' && clients[cid] && clients[cid].eid) {
      // if signal is MOVE ENTITY and signal target is owned by client, perform
      clients[cid].entity.move(data.params[1], data.params[2]);
    }
    socket.to('root').emit('gameEvent', data);
  });
});

app.listen(REST_PORT, () => console.log(`REST API Server open, listening on ${REST_PORT}`));
server.listen(SOCK_PORT, () => console.log(`Socket server open, listening on ${SOCK_PORT}`));
