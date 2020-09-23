import io from 'socket.io-client';

class SocketInterface {
  constructor(targetEventQueue, socketAddr) {
    this.eventQueue = targetEventQueue;
    this.socket = io(socketAddr);

    // register socket id to client id
    this.socket.on('connect', () => {
      console.log('Socket Connected');
      this.socket.emit('register', { cookie: document.cookie });
    });

    this.socket.on('gameEvent', (data) => {
      console.log(data.signal);
      this.eventQueue.enqueue(data);
    });
  }

  emit(type, data) {
    this.socket.emit(type, data);
  }
}

export default SocketInterface;
