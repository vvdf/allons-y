const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Engine = require('./Engine');
const engine = new Engine();
const { parseCookies } = require('./utility');

const REST_PORT = 3000;
const SOCK_PORT = 3001;
app.use(express.json());

// TODO - to be reformatted into DBMS
// TODO - refactor for UserID and SessionID management once a proper
//   login/register interface is implemented on the front end

app.use('/', express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/user', (req, res) => {
  // creates client ID cookie if one doesn't exist
  // returns found === true if clientID is active, aka has a corresp. entityID
  const { uid } = parseCookies(req.headers.cookie);
  const userID = uid && uid.length > 0 ? uid : engine.newUser();
  const responseData = {
    found: engine.userHasEntity(userID), // ret true if user exists AND user has entity
    userID: userID,
  };
  res.cookie('uid', userID).status(200).send(responseData);
});

app.post('/entity', (req, res) => {
  // create entity (and guild, and user if ones do not exist) based on submitted name/locale
  const { uid } = parseCookies(req.headers.cookie);
  const { name, area } = req.body;
  const gid = engine.guildExists(area) ? engine.getGuild(area) : engine.newGuild(area); // if no guild exists, create
  const userId = engine.userExists(uid) ? uid : engine.newUser(); // if no user exists, create
  const eid = engine.newEntity(name); // generate new entity
  engine.setEntityId(userId, eid); // connect user to entity
  engine.setGuildId(userId, gid); // connect user to guild
  res.cookie('uid', userId).status(200).send(); // update uid cookie
});

// load all entities, starting with player (will be empty if cid not found/registered)
app.get('/entity', (req, res) => {
  const { uid } = parseCookies(req.headers.cookie);
  res.status(200).send(engine.getEntityByUid(uid));
});

// map loading
app.get('/map', (req, res) => {
  console.log('-- MAP REQUESTED');
  const { uid } = parseCookies(req.headers.cookie);
  if (engine.userExists(uid) && engine.userHasEntity(uid)) {
    const eid = engine.getEntityId(uid); // get respective entity's id, to generate a map for them
    const mid = engine.hasMap(eid) ? engine.getMapId(eid) : engine.newMap(eid);
    const mapData = engine.getMapObj(mid);
    mapData.spawn = engine.getEntityPos(eid);
    res.status(200).send(mapData);
    console.log('-- MAP SENT', mid);
  } else {
    const message = `User ID ${engine.userExists(uid) ? '' : 'Not '}Found,` +
      ` Entity ID ${engine.userHasEntity(uid) ? '' : 'Not '} Found`;
    console.log(message);
    res.status(400).send({ mapFound: false, message });
    console.log('-- MAP FAILED TO SEND');
  }
});

io.on('connection', (socket) => {
  let uid;

  socket.on('register', ({ cookie }) => {
    console.log('REGISTER DATA RECEIVED: ', cookie);
    uid = parseCookies(cookie).uid;
    socket.join('root');

    // TODO - generate a userID if one doesn't exist
    if (engine.userExists(uid) && engine.userHasEntity(uid)) {
      // console.log('CLIENT ID FOUND, attached EID = ', clients[cid].eid);
      const { eid, name, textureKey } = engine.getEntityByUid(uid);
      // const pos = engine.getEntityPos(eid);
      engine.setSocketId(uid, socket.id);

      // clients[cid].sid = socket.id;
      io.to(socket.id).emit('gameEvent', {
        signal: 'DEBUG_MSG',
        params: ['SID REGISTERED'],
      });
      // socket.to('/').emit('gameEvent', {
      //   signal: 'NEW_ENTITY',
      //   params: [eid, name, textureKey, pos],
      // });
    } else {
      // TODO - signal to reregister for a client ID
      // NOTE - io.to broadcasts from server,
      //  socket.to broadcasts from (and not back to) sender
    }
  });

  socket.on('gameEvent', (data) => {
    if (data.signal === 'INIT_MAP' && engine.userHasEntity(uid)) {
      console.log('INIT_MAP signal received, processing...');
      const npcs = engine.getEntitiesByUid(uid);
      for (let i = 0; i < npcs.length; i += 1) {
        if (npcs[i].eid !== engine.getEntityId(uid)) {
          const { eid, name, textureKey, pos, blocking } = npcs[i];
          io.to('root').emit('gameEvent', {
            signal: 'NEW_ENTITY',
            params: [eid, name, textureKey, { x: pos.x, y: pos.y, blocking: pos.blocking }],
          });
        }
      }
    }

    if (data.signal === 'MOVE_ENTITY' && engine.userExists(uid) && engine.userOwnsEntity(uid, data.params[0])) {
      // if signal is MOVE ENTITY, AND userid is registered, AND user is owner of submitted entity
      const eid = data.params[0];
      const dx = data.params[1];
      const dy = data.params[2];
      const pos = engine.getEntityPos(eid);
      engine.moveEntity(eid, pos.x + dx, pos.y + dy);
    }

    socket.to('root').emit('gameEvent', data);
  });
});

app.listen(REST_PORT, () => console.log(`REST API Server open, listening on ${REST_PORT}`));
server.listen(SOCK_PORT, () => console.log(`Socket server open, listening on ${SOCK_PORT}`));
