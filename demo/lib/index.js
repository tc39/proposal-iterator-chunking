"use strict";
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([].values()));
function liftIterator(iter) {
    return { [Symbol.iterator]() { return iter; } };
}
function* chunksImpl(iter, chunkSize) {
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
function chunks(chunkSize) {
    if (typeof chunkSize !== 'number'
        || chunkSize <= 0
        || Math.floor(chunkSize) !== chunkSize
        || chunkSize >= Math.pow(2, 53)) {
        throw new RangeError;
    }
    return chunksImpl(this, chunkSize);
}
function* windowsImpl(iter, windowSize, undersized) {
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
function windows(windowSize, undersized) {
    if (typeof windowSize !== 'number'
        || windowSize <= 0
        || Math.floor(windowSize) !== windowSize
        || windowSize >= Math.pow(2, 53)) {
        throw new RangeError;
    }
    if (undersized === undefined) {
        undersized = 'only-full';
    }
    if (undersized !== 'only-full' && undersized !== 'allow-partial') {
        throw new TypeError;
    }
    return windowsImpl(this, windowSize, undersized);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFFbkYsU0FBUyxZQUFZLENBQUksSUFBaUI7SUFDeEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbEQsQ0FBQztBQUVELFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBSSxJQUFpQixFQUFFLFNBQWlCO0lBQzFELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFLLE1BQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxNQUFNLENBQUM7WUFDYixNQUFNLEdBQUcsRUFBRSxDQUFDO1NBQ2I7S0FDRjtJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDckIsTUFBTSxNQUFNLENBQUM7S0FDZDtBQUNILENBQUM7QUFHRCxTQUFTLE1BQU0sQ0FBZ0IsU0FBa0I7SUFDL0MsSUFDRSxPQUFPLFNBQVMsS0FBSyxRQUFRO1dBQzFCLFNBQVMsSUFBSSxDQUFDO1dBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTO1dBQ25DLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDL0I7UUFDQSxNQUFNLElBQUksVUFBVSxDQUFDO0tBQ3RCO0lBQ0QsT0FBTyxVQUFVLENBQUMsSUFBeUIsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUN6RCxDQUFDO0FBRUQsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFJLElBQWlCLEVBQUUsVUFBa0IsRUFBRSxVQUF5QztJQUN2RyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsS0FBSyxNQUFNLElBQUksSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtZQUNoQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDaEI7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7WUFDaEMsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdEI7S0FDRjtJQUNELElBQUksVUFBVSxLQUFLLGVBQWUsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsRUFBRTtRQUNyRixNQUFNLE1BQU0sQ0FBQztLQUNkO0FBQ0gsQ0FBQztBQUdELFNBQVMsT0FBTyxDQUFnQixVQUFtQixFQUFFLFVBQW9CO0lBQ3ZFLElBQ0UsT0FBTyxVQUFVLEtBQUssUUFBUTtXQUMzQixVQUFVLElBQUksQ0FBQztXQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssVUFBVTtXQUNyQyxVQUFVLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ2hDO1FBQ0EsTUFBTSxJQUFJLFVBQVUsQ0FBQztLQUN0QjtJQUNELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtRQUM1QixVQUFVLEdBQUcsV0FBVyxDQUFDO0tBQzFCO0lBQ0QsSUFBSSxVQUFVLEtBQUssV0FBVyxJQUFJLFVBQVUsS0FBSyxlQUFlLEVBQUU7UUFDaEUsTUFBTSxJQUFJLFNBQVMsQ0FBQztLQUNyQjtJQUNELE9BQU8sV0FBVyxDQUFDLElBQXlCLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3hFLENBQUM7QUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLFFBQVEsRUFBRTtJQUNqRCxZQUFZLEVBQUUsSUFBSTtJQUNsQixRQUFRLEVBQUUsSUFBSTtJQUNkLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLEtBQUssRUFBRSxNQUFNO0NBQ2QsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUU7SUFDbEQsWUFBWSxFQUFFLElBQUk7SUFDbEIsUUFBUSxFQUFFLElBQUk7SUFDZCxVQUFVLEVBQUUsS0FBSztJQUNqQixLQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQyJ9