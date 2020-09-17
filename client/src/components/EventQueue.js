class EventQueue {
  constructor(maxLength = 0) {
    this.maxLength = maxLength;
    this.queue = [];
    this.head = null;
    this.tail = null;
  }

  enqueue(item) {
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }
}

export default EventQueue;
