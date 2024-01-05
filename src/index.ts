const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([].values()))

function liftIterator<A>(iter: Iterator<A>): Iterable<A> {
  return { [Symbol.iterator]() { return iter; } };
}

function* chunksImpl<A>(iter: Iterator<A>, chunkSize: number): Generator<Array<A>> {
  let buffer = [];
  for (const elem of liftIterator(iter)) {
    buffer.push(elem);
    if (buffer.length === chunkSize) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) {
    yield buffer;
  }
}

function chunks<A>(this: Iterator<A>, chunkSize: number): Generator<Array<A>>
function chunks(this: unknown, chunkSize: unknown = 2): Generator<unknown> {
  if (
    typeof chunkSize !== 'number'
    || chunkSize <= 0
    || Math.floor(chunkSize) !== chunkSize
    || chunkSize >= Math.pow(2, 53)
  ) {
    throw new RangeError;
  }
  return chunksImpl(this as Iterator<unknown>, chunkSize)
}

function* windowsImpl<A>(iter: Iterator<A>, windowSize: number): Generator<Array<A>> {
  let buffer = [];
  for (const elem of liftIterator(iter)) {
    if (buffer.length === windowSize) {
      buffer.shift();
    }
    buffer.push(elem);
    if (buffer.length === windowSize) {
      yield buffer.slice();
    }
  }
}

function windows<A>(this: Iterator<A>, windowSize: number): Generator<Array<A>>
function windows(this: unknown, windowSize: unknown = 2): Generator<unknown> {
  if (
    typeof windowSize !== 'number'
    || windowSize <= 0
    || Math.floor(windowSize) !== windowSize
    || windowSize >= Math.pow(2, 53)
  ) {
    throw new RangeError;
  }
  return windowsImpl(this as Iterator<unknown>, windowSize)
}

Object.defineProperty(IteratorPrototype, 'chunks', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: chunks,
});

Object.defineProperty(IteratorPrototype, 'windows', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: windows,
});