import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import '../lib/index.js';

function* nats(limit) {
  let n = 0;
  while (n < limit) {
    yield n;
    ++n;
  }
}

test('chunks', async t => {
  assert.deepEqual(
    Array.from(nats(5).chunks(2)),
    [[0, 1], [2, 3], [4]],
  );
  assert.deepEqual(
    Array.from(nats(5).chunks(1)),
    [[0], [1], [2], [3], [4]],
  );
  assert.deepEqual(
    Array.from(nats(6).chunks(2)),
    [[0, 1], [2, 3], [4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(6).chunks(3)),
    [[0, 1, 2], [3, 4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(6).chunks(100)),
    [[0, 1, 2, 3, 4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(0).chunks(2)),
    [],
  );

  assert.throws(() => {
    nats(1).chunks();
  }, RangeError)
  assert.throws(() => {
    nats(1).chunks([2]);
  }, RangeError)
  assert.throws(() => {
    nats(1).chunks(0);
  }, RangeError)
  assert.throws(() => {
    nats(1).chunks(-1);
  }, RangeError)
  assert.throws(() => {
    nats(1).chunks(1.5);
  }, RangeError)
  assert.throws(() => {
    nats(1).chunks(Math.pow(2, 53));
  }, RangeError)
});

test('windows', async t => {
  assert.deepEqual(
    Array.from(nats(5).windows(2)),
    [[0, 1], [1, 2], [2, 3], [3, 4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(2, undefined)),
    [[0, 1], [1, 2], [2, 3], [3, 4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(2, "only-full")),
    [[0, 1], [1, 2], [2, 3], [3, 4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(2, "allow-partial")),
    [[0, 1], [1, 2], [2, 3], [3, 4]],
  );

  assert.deepEqual(
    Array.from(nats(5).windows(1)),
    [[0], [1], [2], [3], [4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(1, undefined)),
    [[0], [1], [2], [3], [4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(1, "only-full")),
    [[0], [1], [2], [3], [4]],
  );
  assert.deepEqual(
    Array.from(nats(5).windows(1, "allow-partial")),
    [[0], [1], [2], [3], [4]],
  );

  assert.deepEqual(
    Array.from(nats(6).windows(3)),
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(3, undefined)),
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(3, "only-full")),
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(3, "allow-partial")),
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]],
  );

  assert.deepEqual(
    Array.from(nats(6).windows(100)),
    [],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(100, undefined)),
    [],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(100, "only-full")),
    [],
  );
  assert.deepEqual(
    Array.from(nats(6).windows(100, "allow-partial")),
    [[0, 1, 2, 3, 4, 5]],
  );

  assert.deepEqual(
    Array.from(nats(0).windows(2)),
    [],
  );
  assert.deepEqual(
    Array.from(nats(0).windows(2, undefined)),
    [],
  );
  assert.deepEqual(
    Array.from(nats(0).windows(2, "only-full")),
    [],
  );
  assert.deepEqual(
    Array.from(nats(0).windows(2, "allow-partial")),
    [],
  );

  assert.throws(() => {
    nats(1).windows()
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(undefined, "only-full")
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(undefined, "allow-partial")
  }, RangeError);

  assert.throws(() => {
    nats(1).windows([2]);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows([2], "only-full");
  }, RangeError);
  assert.throws(() => {
    nats(1).windows([2], "allow-partial");
  }, RangeError);

  assert.throws(() => {
    nats(1).windows(0);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(0, undefined);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(0, "only-full");
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(0, "allow-partial");
  }, RangeError);

  assert.throws(() => {
    nats(1).windows(-1);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(-1, undefined);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(-1, "only-full");
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(-1, "allow-partial");
  }, RangeError);

  assert.throws(() => {
    nats(1).windows(1.5);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(1.5, undefined);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(1.5, "only-full");
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(1.5, "allow-partial");
  }, RangeError);

  assert.throws(() => {
    nats(1).windows(Math.pow(2, 53));
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(Math.pow(2, 53), undefined);
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(Math.pow(2, 53), "only-full");
  }, RangeError);
  assert.throws(() => {
    nats(1).windows(Math.pow(2, 53), "allow-partial");
  }, RangeError);

  assert.throws(() => {
    nats(1).windows(1, "something else");
  }, TypeError);
  assert.throws(() => {
    nats(1).windows(1, "");
  }, TypeError);
  assert.throws(() => {
    nats(1).windows(1, null);
  }, TypeError);

  assert.throws(() => {
    nats(1).windows(0, "something else");
  }, RangeError);

});
