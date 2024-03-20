Iterator Chunking
=================

A TC39 proposal to add a method to iterators for producing an iterator of its subsequences.

**Stage:** 1

See the [January 2024 presentation to committee](https://docs.google.com/presentation/d/1PvU0wOygklWZQUFIZWFLJRyZnFfgd-7LZh6T_z5Ge8g/edit).

## motivation

It can be useful to consume a stream by more than one value at a time. For example, certain algorithms require looking at adjacent elements.

A common solution for this is a `chunks` method that works like the following:

```js
let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

let chunksOf2 = Array.from(digits.chunks(2));
// [ [0, 1], [2, 3], [4, 5], [6, 7], [8, 9] ]

let chunksOf3 = Array.from(digits.chunks(3));
// [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [9] ]

let chunksOf4 = Array.from(digits.chunks(4));
// [ [0, 1, 2, 3], [4, 5, 6, 7], [8, 9] ]
```

A more flexible solution is a sliding window method, usually named `windows`:

```js
let windowsOf3 = Array.from(digits.windows(3));
// [ [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7], [6, 7, 8], [7, 8, 9] ]

let windowsOf2AdvancingBy3 = Array.from(digits.windows(2, 3));
// [ [0, 1], [3, 4], [6, 7], [9] ]
```

`chunks` is just a specialisation of `windows` where `chunks(n)` is equivalent to `windows(n, n)`.

```js
let chunksOf4 = Array.from(digits.windows(4, 4));
// [ [0, 1, 2, 3], [4, 5, 6, 7], [8, 9] ]
```

## design space

* sliding windows sliding in/out past ends instead of sliding within boundaries?
* default chunk size to 2?
* chunking by 0 length?
* windows advancing by 0?
* should truncated chunks be returned?
  * filler/padding elements?
* should windows ever be truncated?
  * should preserve equivalence with chunks, so answer should match chunks
  * only when full iterator doesn't fill a single window?
  * just lock step to 1 for windowing?

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
