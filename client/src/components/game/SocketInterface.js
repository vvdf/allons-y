import io from 'socket.io-client';

class SocketInterface {
  constructor(targetEventQueue, socketAddr) {
    this.eventQueue = targetEventQueue;
    this.socket = io(socketAddr);
    this.onConnect = [];

    // register socket id to client id
    this.socket.on('connect', () => {
      console.log('Socket Connected');
      this.socket.emit('register', { cookie: document.cookie });
      for (let i = 0; i < this.onConnect.length; i += 1) {
        this.socket.emit(this.onConnect[0], this.onConnect[1]);
      }
    });

    this.socket.on('gameEvent', (data) => {
      this.eventQueue.enqueue(data);
    });
  }

  emit(type, data) {
    this.socket.emit(type, data);
  }

  emitOnConnect(type, data) {
    this.socket.emit(type, data);
    this.onConnect.push([type, data]);
  }
}

export default SocketInterface;
