'use strict';
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([].values()));
const IteratorHelperPrototype = typeof IteratorPrototype.take === 'function'
    ? Object.getPrototypeOf(IteratorPrototype.take.call((function* () { })(), 0))
    : IteratorPrototype;
const MAX_CHUNK_OR_WINDOW_SIZE = 2 ** 32 - 1;
const DONE = Symbol('done');
function isObject(obj) {
    return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}
function isIntegralNumber(value) {
    return typeof value === 'number' && Number.isInteger(value);
}
function closeIteratorForThrow(iter, error) {
    try {
        const returnMethod = iter.return;
        if (returnMethod !== undefined && returnMethod !== null) {
            if (typeof returnMethod !== 'function') {
                throw new TypeError;
            }
            Reflect.apply(returnMethod, iter, []);
        }
    }
    catch {
    }
    throw error;
}
function getIteratorDirect(obj) {
    const iterator = obj;
    const next = iterator.next;
    return { iterator, next, done: false };
}
function iteratorStepValue(iterated) {
    if (iterated.done) {
        return DONE;
    }
    const result = Reflect.apply(iterated.next, iterated.iterator, []);
    if (!isObject(result)) {
        throw new TypeError;
    }
    const iteratorResult = result;
    if (iteratorResult.done) {
        iterated.done = true;
        return DONE;
    }
    return iteratorResult.value;
}
function closeIterator(iterated) {
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
function createIteratorHelper(iterated, advance) {
    let state = 'suspended';
    return Object.defineProperties(Object.create(IteratorHelperPrototype), {
        next: {
            configurable: true,
            writable: true,
            value: function next() {
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
                    }
                    else {
                        state = 'suspended';
                    }
                    return result;
                }
                catch (error) {
                    state = 'completed';
                    throw error;
                }
            },
        },
        return: {
            configurable: true,
            writable: true,
            value: function returnMethod() {
                if (state === 'executing') {
                    throw new TypeError;
                }
                if (state !== 'completed') {
                    state = 'completed';
                    if (!iterated.done) {
                        state = 'executing';
                        try {
                            closeIterator(iterated);
                        }
                        finally {
                            state = 'completed';
                        }
                    }
                }
                return { done: true, value: undefined };
            },
        },
    });
}
function chunksImpl(iterated, chunkSize) {
    let buffer = [];
    let finished = false;
    return createIteratorHelper(iterated, () => {
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
function windowsImpl(iterated, windowSize, undersized) {
    let buffer = [];
    let finished = false;
    return createIteratorHelper(iterated, () => {
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
const methods = {
    chunks(chunkSize) {
        if (!isObject(this)) {
            throw new TypeError;
        }
        if (!isIntegralNumber(chunkSize)) {
            closeIteratorForThrow(this, new TypeError);
        }
        if (chunkSize < 1 || chunkSize > MAX_CHUNK_OR_WINDOW_SIZE) {
            closeIteratorForThrow(this, new RangeError);
        }
        return chunksImpl(getIteratorDirect(this), chunkSize);
    },
    windows(windowSize) {
        let undersized = arguments[1];
        if (!isObject(this)) {
            throw new TypeError;
        }
        if (!isIntegralNumber(windowSize)) {
            closeIteratorForThrow(this, new TypeError);
        }
        if (windowSize < 1 || windowSize > MAX_CHUNK_OR_WINDOW_SIZE) {
            closeIteratorForThrow(this, new RangeError);
        }
        if (undersized === undefined) {
            undersized = 'only-full';
        }
        if (undersized !== 'only-full' && undersized !== 'allow-partial') {
            closeIteratorForThrow(this, new TypeError);
        }
        return windowsImpl(getIteratorDirect(this), windowSize, undersized);
    },
};
const chunks = methods.chunks;
const windows = methods.windows;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRixNQUFNLHVCQUF1QixHQUFHLE9BQU8saUJBQWlCLENBQUMsSUFBSSxLQUFLLFVBQVU7SUFDMUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUF1QixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztBQUV0QixNQUFNLHdCQUF3QixHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQVc1QixTQUFTLFFBQVEsQ0FBQyxHQUFZO0lBQzVCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sR0FBRyxLQUFLLFVBQVUsQ0FBQztBQUNoRixDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFjO0lBQ3RDLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBdUIsRUFBRSxLQUFZO0lBQ2xFLElBQUk7UUFDRixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksWUFBWSxLQUFLLFNBQVMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1lBQ3ZE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