Iterator Chunking
=================

A TC39 proposal to add a method to iterators for producing an iterator of its subsequences.

**Stage:** 0

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
* chunking by 0 length?
* windows advancing by 0?
* should truncated chunks be returned?
* should windows ever be truncated?
  * should preserve equivalence with chunks, so answer should match chunks
  * only when full iterator doesn't fill a single window?

## prior art

TODO: expand

### other languages

| language | chunks | windows | chunks of 0? | truncates windows? |
|----------|--------|---------|--------------|--------------------|
| Haskell (split) | `chunksOf` | `divvy` | infinite empty lists | yes |

### JS libraries

| library | chunks | windows | chunks of 0? | truncates windows? |
|---------|--------|---------|--------------|--------------------|
| Lodash / Underscore | `chunk` | -- | infinite empty lists | N/A |
| Ramda | `splitEvery` | `aperture` | infinite empty lists | no |
