Iterator Chunking
=================

A TC39 proposal to consume an iterator as either overlapping or non-overlapping subsequences of configurable size.

**Stage:** 2

**Specification:** https://tc39.es/proposal-iterator-chunking/

## presentations to committee

* [January 2024](https://docs.google.com/presentation/d/1PvU0wOygklWZQUFIZWFLJRyZnFfgd-7LZh6T_z5Ge8g)
* [October 2024](https://docs.google.com/presentation/d/1V2pFMn0s6UIdrjbfaBlfdu9XE4v3u6qD2gBwLRycVr8)

## motivation

It can be useful to consume a stream by more than one value at a time. For example, certain algorithms require looking at adjacent elements.

### chunking

This is commonly solved for non-overlapping subsequences with a "chunking" method that works like the following:

```js
const digits = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

let chunksOf2 = Array.from(digits().chunks(2));
// [ [0, 1], [2, 3], [4, 5], [6, 7], [8, 9] ]

let chunksOf3 = Array.from(digits().chunks(3));
// [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [9] ]

let chunksOf4 = Array.from(digits().chunks(4));
// [ [0, 1, 2, 3], [4, 5, 6, 7], [8, 9] ]
```

#### use cases for chunking

* pagination
* columnar/grid layouts, such as calendars
* batch/stream processing
* matrix operations
* formatting/encoding
* bucketing (using a computed chunk size, for iterators of known size)

### sliding window

When overlapping sequences are needed, this is commonly called a "sliding window".

```js
let windowsOf2 = Array.from(digits().windows(2));
// [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9] ]

let windowsOf3 = Array.from(digits().windows(3));
// [ [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7], [6, 7, 8], [7, 8, 9] ]

let windowsOf4 = Array.from(digits().windows(4));
// [ [0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8], [6, 7, 8, 9] ]
```

#### use cases for sliding windows

* running/continuous computations, such as averages
* context-sensitive algorithms, such as pairwise comparisons
* carousels and their analogues (when applied to an infinite cycle)

## prior art

### other languages

| language | library | chunks | windows | chunks of 0? | truncates windows? |
|----------|---------|--------|---------|--------------|--------------------|
| C++ | std::ranges::views | `chunk` | `slide` | undefined behavior | no |
| Clojure | core | `partition` | `partition` | infinite empty lists | when insufficient padding;<br/>terminates after 1 |
| Elm | List.Extra | `groupsOf` | `groupsOfWithStep` | empty list | no |
| Haskell | split | `chunksOf` | `divvy` | infinite empty lists | yes |
| Java | Stream | `Gatherers.windowFixed` | `Gatherers.windowSliding` | throws | no, step not configurable |
| Kotlin | Iterable | `chunked` | `windowed` | throws | configurable via parameter |
| .NET | System.Linq | `Enumerable.Chunk` | -- | throws | N/A |
| PHP | array | `array_chunk` | -- | throws | N/A |
| Python | itertools (3.12) | `batched` | -- | ?? | N/A |
| Python | more-itertools | `grouper` | `windowed` | empty iterator | no, mandatory fill value |
| Ruby | Enumerable | `each_slice` | `each_cons` | throws | no, step not configurable |
| Rust | Iterator | `array_chunks` | `map_windows` | panics | no, step not configurable |
| Rust | slice | `chunks` | `windows` | panics | no, step not configurable |
| Scala | Seq | `grouped` | `sliding` | throws | yes |
| Swift | Sequence | -- | -- | N/A | N/A |

### JS libraries

| library | chunks | windows | chunks of 0? | truncates windows? |
|---------|--------|---------|--------------|--------------------|
| `chunk` | `chunk` | -- | coerces 0 to false 😞 | N/A |
| `extra-iterable` | `chunk` | `chunk` | infinite empty arrays | yes |
| `iter-ops` | `page` | -- | throws | N/A |
| `iter-tools` | `batch` | `window`, `windowAhead`, `windowBehind` | throws | optionally |
| `iterablefu` | `chunk` | -- | collects everything into a single array | N/A |
| `itertools-ts` | `chunkwise` | `chunkwiseOverlap` | throws | yes |
| Lodash / Underscore | `chunk` | -- | infinite empty arrays | N/A |
| Ramda | `splitEvery` | `aperture` | infinite empty arrays | no |
| sequency | `chunk` | -- | throws | N/A |
| wu | `chunk` | -- | collects everything into a single array | N/A |
