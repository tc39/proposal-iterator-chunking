declare const IteratorPrototype: any;
declare const IteratorHelperPrototype: any;
declare const MAX_CHUNK_OR_WINDOW_SIZE: number;
declare const DONE: unique symbol;
type IteratorRecord<A> = {
    iterator: Iterator<A>;
    next: unknown;
    done: boolean;
};
type IteratorHelperState = 'suspended' | 'executing' | 'completed';
type Undersized = 'only-full' | 'allow-partial';
declare function isObject(obj: unknown): obj is object;
declare function isIntegralNumber(value: unknown): value is number;
declare function closeIteratorForThrow(iter: Iterator<unknown>, error: Error): never;
declare function getIteratorDirect<A>(obj: object): IteratorRecord<A>;
declare function iteratorStepValue<A>(iterated: IteratorRecord<A>): A | typeof DONE;
declare function closeIterator(iterated: IteratorRecord<unknown>): void;
declare function createIteratorHelper<A>(iterated: IteratorRecord<unknown>, advance: () => IteratorResult<A>): Iterator<A>;
declare function chunksImpl<A>(iterated: IteratorRecord<A>, chunkSize: number): Iterator<Array<A>>;
declare function windowsImpl<A>(iterated: IteratorRecord<A>, windowSize: number, undersized: Undersized): Iterator<Array<A>>;
type ChunksMethod = {
    <A>(this: Iterator<A>, chunkSize: number): Iterator<Array<A>>;
    (this: unknown, chunkSize: unknown): Iterator<unknown>;
};
type WindowsMethod = {
    <A>(this: Iterator<A>, windowSize: number, undersized?: Undersized): Iterator<Array<A>>;
    (this: unknown, windowSize: unknown, undersized?: unknown): Iterator<unknown>;
};
declare const methods: {
    chunks(this: unknown, chunkSize: unknown): Iterator<unknown>;
    windows(this: unknown, windowSize: unknown): Iterator<unknown>;
};
declare const chunks: ChunksMethod;
declare const windows: WindowsMethod;
