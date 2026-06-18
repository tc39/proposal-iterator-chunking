'use strict';

const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([].values()));
const IteratorHelperPrototype = typeof IteratorPrototype.take === 'function'
  ? Object.getPrototypeOf(IteratorPrototype.take.call((function* (): Generator<never> {})(), 0))
  : IteratorPrototype;

const MAX_CHUNK_OR_WINDOW_SIZE = 2 ** 32 - 1;
const DONE = Symbol('done');

type IteratorRecord<A> = {
  iterator: Iterator<A>;
  next: unknown;
  done: boolean;
};

type IteratorHelperState = 'suspended' | 'executing' | 'completed';
type Undersized = 'only-full' | 'allow-partial';

function isObject(obj: unknown): obj is object {
  return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}

function isIntegralNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function closeIteratorForThrow(iter: Iterator<unknown>, error: Error): never {
  try {
    const returnMethod = iter.return;
    if (returnMethod !== undefined && returnMethod !== null) {
      if (typeof returnMethod !== 'function') {
        throw new TypeError;
      }
      Reflect.apply(returnMethod, iter, []);
    }
  } catch {
  }
  throw error;
}

function getIteratorDirect<A>(obj: object): IteratorRecord<A> {
  const iterator = obj as Iterator<A>;
  const next = iterator.next;
  return { iterator, next, done: false };
}

function iteratorStepValue<A>(iterated: IteratorRecord<A>): A | typeof DONE {
  if (iterated.done) {
    return DONE;
  }
  const result = Reflect.apply(iterated.next as Function, iterated.iterator, []);
  if (!isObject(result)) {
    throw new TypeError;
  }
  const iteratorResult = result as IteratorResult<A>;
  if (iteratorResult.done) {
    iterated.done = true;
    return DONE;
  }
  return iteratorResult.value;
}

function closeIterator(iterated: IteratorRecord<unknown>): void {
  iterated.done = true;
  const returnMethod = iterated.iterator.return;
  if (returnMethod === undefined || returnMethod === null) {
    return;
  }
  if (typeof returnMethod !== 'function') {
    throw new TypeError;
  }
  const result = Reflect.apply(returnMethod, iterated.iterator, []);
  if (!isObject(result)) {
    throw new TypeError;
  }
}

function createIteratorHelper<A>(
  iterated: IteratorRecord<unknown>,
  advance: () => IteratorResult<A>,
): Iterator<A> {
  let state: IteratorHelperState = 'suspended';

  return Object.defineProperties(Object.create(IteratorHelperPrototype), {
    next: {
      configurable: true,
      writable: true,
      value: function next(): IteratorResult<A> {
        if (state === 'executing') {
          throw new TypeError;
        }
        if (state === 'completed') {
          return { done: true, value: undefined };
        }
        state = 'executing';
        try {
          const result = advance();
          if (result.done) {
            state = 'completed';
          } else {
            state = 'suspended';
          }
          return result;
        } catch (error) {
          state = 'completed';
          throw error;
        }
      },
    },
    return: {
      configurable: true,
      writable: true,
      value: function returnMethod(): IteratorResult<A> {
        if (state === 'executing') {
          throw new TypeError;
        }
        if (state !== 'completed') {
          state = 'completed';
          if (!iterated.done) {
            state = 'executing';
            try {
              closeIterator(iterated);
            } finally {
              state = 'completed';
            }
          }
        }
        return { done: true, value: undefined };
      },
    },
  }) as Iterator<A>;
}

function chunksImpl<A>(iterated: IteratorRecord<A>, chunkSize: number): Iterator<Array<A>> {
  let buffer: Array<A> = [];
  let finished = false;

  return createIteratorHelper<Array<A>>(iterated, () => {
    if (finished) {
      return { done: true, value: undefined };
    }
    while (true) {
      const value = iteratorStepValue(iterated);
      if (value === DONE) {
        if (buffer.length > 0) {
          const chunk = buffer;
          buffer = [];
          finished = true;
          return { done: false, value: chunk };
        }
        return { done: true, value: undefined };
      }
      buffer.push(value);
      if (buffer.length === chunkSize) {
        const chunk = buffer;
        buffer = [];
        return { done: false, value: chunk };
      }
    }
  });
}

function windowsImpl<A>(iterated: IteratorRecord<A>, windowSize: number, undersized: Undersized): Iterator<Array<A>> {
  let buffer: Array<A> = [];
  let finished = false;

  return createIteratorHelper<Array<A>>(iterated, () => {
    if (finished) {
      return { done: true, value: undefined };
    }
    while (true) {
      const value = iteratorStepValue(iterated);
      if (value === DONE) {
        if (undersized === 'allow-partial' && 0 < buffer.length && buffer.length < windowSize) {
          const window = buffer;
          buffer = [];
          finished = true;
          return { done: false, value: window };
        }
        return { done: true, value: undefined };
      }
      if (buffer.length === windowSize) {
        buffer.shift();
      }
      buffer.push(value);
      if (buffer.length === windowSize) {
        return { done: false, value: buffer.slice() };
      }
    }
  });
}

type ChunksMethod = {
  <A>(this: Iterator<A>, chunkSize: number): Iterator<Array<A>>;
  (this: unknown, chunkSize: unknown): Iterator<unknown>;
};

type WindowsMethod = {
  <A>(this: Iterator<A>, windowSize: number, undersized?: Undersized): Iterator<Array<A>>;
  (this: unknown, windowSize: unknown, undersized?: unknown): Iterator<unknown>;
};

const methods = {
  chunks(this: unknown, chunkSize: unknown): Iterator<unknown> {
    if (!isObject(this)) {
      throw new TypeError;
    }
    if (!isIntegralNumber(chunkSize)) {
      closeIteratorForThrow(this as Iterator<unknown>, new TypeError);
    }
    if (chunkSize < 1 || chunkSize > MAX_CHUNK_OR_WINDOW_SIZE) {
      closeIteratorForThrow(this as Iterator<unknown>, new RangeError);
    }
    return chunksImpl(getIteratorDirect(this), chunkSize);
  },
  windows(this: unknown, windowSize: unknown): Iterator<unknown> {
    let undersized: unknown = arguments[1];
    if (!isObject(this)) {
      throw new TypeError;
    }
    if (!isIntegralNumber(windowSize)) {
      closeIteratorForThrow(this as Iterator<unknown>, new TypeError);
    }
    if (windowSize < 1 || windowSize > MAX_CHUNK_OR_WINDOW_SIZE) {
      closeIteratorForThrow(this as Iterator<unknown>, new RangeError);
    }
    if (undersized === undefined) {
      undersized = 'only-full';
    }
    if (undersized !== 'only-full' && undersized !== 'allow-partial') {
      closeIteratorForThrow(this as Iterator<unknown>, new TypeError);
    }
    return windowsImpl(getIteratorDirect(this), windowSize, undersized);
  },
};

const chunks = methods.chunks as ChunksMethod;
const windows = methods.windows as WindowsMethod;

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
