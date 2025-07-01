declare const IteratorPrototype: any;
declare function liftIterator<A>(iter: Iterator<A>): Iterable<A>;
declare function chunksImpl<A>(iter: Iterator<A>, chunkSize: number): Generator<Array<A>>;
declare function chunks<A>(this: Iterator<A>, chunkSize: number): Generator<Array<A>>;
declare function windowsImpl<A>(iter: Iterator<A>, windowSize: number): Generator<Array<A>>;
declare function windows<A>(this: Iterator<A>, windowSize: number): Generator<Array<A>>;
declare function slidingImpl<A>(iter: Iterator<A>, windowSize: number): Generator<Array<A>>;
declare function sliding<A>(this: Iterator<A>, windowSize: number): Generator<Array<A>>;
