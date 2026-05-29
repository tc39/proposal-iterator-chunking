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
function chunks(this: unknown, chunkSize: unknown): Generator<unknown> {
  if (typeof chunkSize !== 'number' || Math.floor(chunkSize) !== chunkSize) {
    throw new TypeError;
  }
  if (chunkSize <= 0 || chunkSize >= Math.pow(2, 53)) {
    throw new RangeError;
  }
  return chunksImpl(this as Iterator<unknown>, chunkSize)
}

function* windowsImpl<A>(iter: Iterator<A>, windowSize: number, undersized: 'only-full' | 'allow-partial'): Generator<Array<A>> {
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
  if (undersized === 'allow-partial' && 0 < buffer.length && buffer.length < windowSize) {
    yield buffer;
  }
}

function windows<A>(this: Iterator<A>, windowSize: number, undersized?: 'only-full' | 'allow-partial'): Generator<Array<A>>
function windows(this: unknown, windowSize: unknown, undersized?: unknown): Generator<unknown> {
  if (typeof windowSize !== 'number' || Math.floor(windowSize) !== windowSize) {
    throw new TypeError;
  }
  if (windowSize <= 0 || windowSize >= Math.pow(2, 53)) {
    throw new RangeError;
  }
  if (undersized === undefined) {
    undersized = 'only-full';
  }
  if (undersized !== 'only-full' && undersized !== 'allow-partial') {
    throw new TypeError;
  }
  return windowsImpl(this as Iterator<unknown>, windowSize, undersized);
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
