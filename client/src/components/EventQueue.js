class EventQueue {
  constructor(maxLength = 0) {
    this.maxLength = maxLength;
    this.length = 0;
    this.eventMap = {}; // EVENT SIGNAL : RESPONSE reducer map
    this.queue = [];
  }

  enqueue(event) {
    // events are SIGNAL : PARAMS
    if (this.maxLength < 1 || this.queue.length < this.maxLength) {
      this.queue.push(event);
      this.length += 1;
    }
  }

  dequeue() {
    this.length -= 1;
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }

  next() {
    const { signal, params } = this.dequeue();
    this.eventMap[signal](...params);
  }

  defineEvent(signal, callback) {
    // events are a combination of a SIGNAL and a RESPONSE
    // (who is accessed by the signal key)
    this.eventMap[signal] = callback;
  }
}

export default EventQueue;
