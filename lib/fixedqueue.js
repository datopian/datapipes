function FixedQueue(maxsize) {
  if (!(this instanceof FixedQueue)) return new FixedQueue(size);
  this._maxsize = maxsize;
  this._queue = [];
}

FixedQueue.prototype.push = function(item) {
  this._queue.push(item);
  if (this._queue.length > this._maxsize) {
    shifted = this._queue.shift();
    return shifted;
  }
  return undefined;
};

FixedQueue.prototype.shift = function() {
  return this._queue.shift();
};

FixedQueue.prototype.get = function() {
  return this._queue;
};

module.exports = FixedQueue;
