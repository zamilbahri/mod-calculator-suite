import assert from 'node:assert/strict';
import test from 'node:test';
import { performance } from 'node:perf_hooks';

import {
  assertInvertible,
  assertSquare,
  determinantMod,
  generateRandomInvertibleMatrixMod,
  inverseMatrixMod,
  multiplyMatrixMod,
  reduceMatrixMod,
  rrefMatrixMod,
} from './numberTheory';
import { generateIdentityMatrix } from './numberTheory/matrix';

const RUN_PERF_DIAGNOSTICS = false;

function multiplyMod(a: bigint[][], b: bigint[][], m: bigint): bigint[][] {
  const rows = a.length;
  const cols = b[0].length;
  const shared = b.length;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      let acc = 0n;
      for (let k = 0; k < shared; k++) {
        acc += a[r][k] * b[k][c];
      }
      const mod = acc % m;
      return mod < 0n ? mod + m : mod;
    }),
  );
}

test('reduceMatrixMod normalizes entries into [0, m-1] and does not mutate input', () => {
  const input = [
    [-1n, 5n, 14n],
    [0n, -8n, 3n],
  ];
  const snapshot = input.map((row) => [...row]);
  const reduced = reduceMatrixMod(input, 7n);

  assert.deepEqual(reduced, [
    [6n, 5n, 0n],
    [0n, 6n, 3n],
  ]);
  assert.deepEqual(input, snapshot);
});

test('reduceMatrixMod validates modulus and matrix shape', () => {
  assert.throws(() => reduceMatrixMod([[1n]], 1n), /m must be at least 2/);
  assert.throws(() => reduceMatrixMod([], 7n), /at least one row/);
  assert.throws(() => reduceMatrixMod([[]], 7n), /at least one column/);
  assert.throws(
    () => reduceMatrixMod([[1n, 2n], [3n]], 7n),
    /same number of columns/,
  );
});

test('assertSquare accepts square matrices and rejects non-square matrices', () => {
  assert.doesNotThrow(() =>
    assertSquare([
      [1n, 2n],
      [3n, 4n],
    ]),
  );
  assert.throws(
    () =>
      assertSquare([
        [1n, 2n, 3n],
        [4n, 5n, 6n],
      ]),
    /square/,
  );
  assert.throws(
    () =>
      assertSquare([
        [1n, 2n],
        [3n],
      ]),
    /same number of columns/,
  );
  assert.throws(() => assertSquare([]), /at least one row/);
});

test('assertInvertible accepts invertible matrices and rejects others', () => {
  assert.doesNotThrow(() =>
    assertInvertible(
      [
        [1n, 2n],
        [3n, 4n],
      ],
      5n,
    ),
  );
  assert.throws(
    () =>
      assertInvertible(
        [
          [2n, 0n],
          [0n, 2n],
        ],
        4n,
      ),
    /not invertible modulo m/,
  );
  assert.throws(
    () =>
      assertInvertible(
        [
          [1n, 2n, 3n],
          [4n, 5n, 6n],
        ],
        7n,
      ),
    /square/,
  );
  assert.throws(
    () =>
      assertInvertible(
        [
          [1n, 0n],
          [0n, 1n],
        ],
        1n,
      ),
    /m must be at least 2/,
  );
});

test('determinantMod computes expected reduced determinant values', () => {
  assert.equal(
    determinantMod(
      [
        [1n, 2n],
        [3n, 4n],
      ],
      5n,
    ),
    3n,
  );

  assert.equal(
    determinantMod(
      [
        [2n, 4n],
        [1n, 2n],
      ],
      11n,
    ),
    0n,
  );
});

test('determinantMod rejects non-square matrices', () => {
  assert.throws(
    () =>
      determinantMod(
        [
          [1n, 2n, 3n],
          [4n, 5n, 6n],
        ],
        7n,
      ),
    /square/,
  );
});

test('multiplyMatrixMod computes matrix-matrix and matrix-vector products', () => {
  const a = [
    [1n, 2n],
    [3n, 4n],
  ];
  const b = [
    [5n, 6n],
    [7n, 8n],
  ];
  const v = [9n, 10n];

  assert.deepEqual(multiplyMatrixMod(a, b, 11n), [
    [8n, 0n],
    [10n, 6n],
  ]);
  assert.deepEqual(multiplyMatrixMod(a, v, 11n), [7n, 1n]);
});

test('multiplyMatrixMod validates dimensions and modulus', () => {
  assert.throws(
    () => multiplyMatrixMod([[1n, 2n]], [[1n, 2n]], 7n),
    /Incompatible dimensions/,
  );
  assert.throws(
    () =>
      multiplyMatrixMod(
        [
          [1n, 2n],
          [3n, 4n],
        ],
        [1n],
        7n,
      ),
    /Incompatible dimensions/,
  );
  assert.throws(
    () => multiplyMatrixMod([[1n]], [[1n]], 1n),
    /m must be at least 2/,
  );
});

test('rrefMatrixMod returns identity for full-rank invertible matrix over prime modulus', () => {
  const result = rrefMatrixMod(
    [
      [1n, 2n],
      [3n, 4n],
    ],
    5n,
  );

  assert.deepEqual(result.matrix, [
    [1n, 0n],
    [0n, 1n],
  ]);
  assert.equal(result.rank, 2);
  assert.deepEqual(result.pivotColumns, [0, 1]);
});

test('rrefMatrixMod skips non-unit pivots when modulus is composite', () => {
  const result = rrefMatrixMod(
    [
      [2n, 0n],
      [0n, 1n],
    ],
    4n,
  );

  assert.deepEqual(result.matrix, [
    [0n, 1n],
    [2n, 0n],
  ]);
  assert.equal(result.rank, 1);
  assert.deepEqual(result.pivotColumns, [1]);
});

test('inverseMatrixMod computes matrix inverse modulo m', () => {
  const a = [
    [1n, 2n],
    [3n, 4n],
  ];
  const inv = inverseMatrixMod(a, 5n);

  assert.deepEqual(inv, [
    [3n, 1n],
    [4n, 2n],
  ]);

  const product = multiplyMod(a, inv, 5n);
  assert.deepEqual(product, [
    [1n, 0n],
    [0n, 1n],
  ]);
});

test('inverseMatrixMod rejects non-square and non-invertible matrices', () => {
  assert.throws(
    () =>
      inverseMatrixMod(
        [
          [1n, 2n, 3n],
          [4n, 5n, 6n],
        ],
        7n,
      ),
    /square/,
  );

  assert.throws(
    () =>
      inverseMatrixMod(
        [
          [2n, 0n],
          [0n, 2n],
        ],
        4n,
      ),
    /not invertible modulo m/,
  );
});

test('inverseMatrixMod computes expected inverse for provided 5x5 matrix mod 26', (t) => {
  const start = RUN_PERF_DIAGNOSTICS ? performance.now() : 0;
  const matrix = [
    [24n, 4n, 0n, 9n, 12n],
    [22n, 24n, 13n, 23n, 17n],
    [10n, 20n, 2n, 1n, 13n],
    [20n, 25n, 4n, 5n, 16n],
    [21n, 0n, 1n, 0n, 22n],
  ];

  const expectedInverse = [
    [4n, 17n, 17n, 10n, 17n],
    [7n, 24n, 14n, 25n, 2n],
    [8n, 1n, 21n, 8n, 18n],
    [25n, 24n, 16n, 8n, 14n],
    [23n, 18n, 23n, 22n, 22n],
  ];

  const inverse = inverseMatrixMod(matrix, 26n);
  if (RUN_PERF_DIAGNOSTICS) {
    t.diagnostic(
      `Computed inverse for 5x5 matrix mod 26 in ${(performance.now() - start).toFixed(2)}ms`,
    );
  }
  assert.deepEqual(inverse, expectedInverse);
});

test('inverseMatrixMod computes expected inverse for provided 10x10 matrix mod 101', (t) => {
  const start = RUN_PERF_DIAGNOSTICS ? performance.now() : 0;

  const matrix = [
    [87n, 10n, 81n, 28n, 85n, 100n, 74n, 92n, 9n, 100n],
    [75n, 92n, 5n, 8n, 83n, 84n, 59n, 64n, 93n, 29n],
    [6n, 10n, 98n, 48n, 50n, 75n, 2n, 19n, 8n, 62n],
    [49n, 77n, 71n, 87n, 14n, 41n, 97n, 54n, 26n, 21n],
    [70n, 15n, 50n, 20n, 15n, 18n, 88n, 0n, 37n, 76n],
    [27n, 33n, 61n, 42n, 75n, 33n, 72n, 29n, 44n, 3n],
    [82n, 35n, 50n, 67n, 0n, 92n, 37n, 39n, 40n, 52n],
    [91n, 18n, 79n, 43n, 6n, 96n, 61n, 34n, 1n, 31n],
    [8n, 49n, 32n, 72n, 59n, 1n, 86n, 95n, 54n, 39n],
    [80n, 15n, 64n, 91n, 60n, 100n, 95n, 98n, 52n, 28n],
  ];

  const inverse = inverseMatrixMod(matrix, 101n);
  if (RUN_PERF_DIAGNOSTICS) {
    t.diagnostic(
      `Computed inverse for 10x10 matrix mod 101 in ${(performance.now() - start).toFixed(2)}ms`,
    );
  }

  const expectedInverse = [
    [13n, 48n, 9n, 67n, 67n, 93n, 35n, 5n, 76n, 39n],
    [96n, 60n, 88n, 22n, 33n, 29n, 2n, 87n, 21n, 31n],
    [20n, 61n, 27n, 14n, 23n, 79n, 47n, 11n, 52n, 97n],
    [28n, 59n, 14n, 70n, 51n, 17n, 38n, 10n, 76n, 12n],
    [16n, 100n, 92n, 47n, 33n, 53n, 96n, 85n, 87n, 71n],
    [79n, 48n, 74n, 0n, 87n, 26n, 29n, 43n, 15n, 52n],
    [10n, 36n, 11n, 34n, 31n, 21n, 59n, 15n, 61n, 81n],
    [52n, 17n, 88n, 44n, 17n, 97n, 43n, 79n, 99n, 80n],
    [57n, 93n, 93n, 19n, 26n, 68n, 70n, 23n, 8n, 11n],
    [96n, 40n, 20n, 77n, 100n, 20n, 72n, 63n, 98n, 22n],
  ];

  assert.deepEqual(inverse, expectedInverse);
});

test('generateRandomInvertibleMatrixMod validates inputs', () => {
  assert.throws(
    () => generateRandomInvertibleMatrixMod(0, 7n),
    /size must be a positive integer/,
  );
  assert.throws(
    () => generateRandomInvertibleMatrixMod(3, 1n),
    /m must be at least 2/,
  );
});

test('generateRandomInvertibleMatrixMod builds invertible high-order matrices', () => {
  const size = 10;
  const m = 101n;

  for (let i = 0; i < 4; i++) {
    const matrix = generateRandomInvertibleMatrixMod(size, m);
    assert.equal(matrix.length, size);
    assert.equal(matrix[0].length, size);

    const inv = inverseMatrixMod(matrix, m);
    const product = multiplyMod(matrix, inv, m);

    const identity = generateIdentityMatrix(size);
    assert.deepEqual(product, identity);
  }
});

test('generateRandomInvertibleMatrixMod builds invertible higher order matrices', (t) => {
  const size = 10;
  const m = 101n;

  for (let i = 0; i < 5; i++) {
    const start = RUN_PERF_DIAGNOSTICS ? performance.now() : 0;
    const matrix = generateRandomInvertibleMatrixMod(size, m);
    if (RUN_PERF_DIAGNOSTICS) {
      t.diagnostic(
        `Generated invertible ${size}x${size} matrix mod ${m} in ${(performance.now() - start).toFixed(2)}ms`,
      );
    }
    assert.equal(matrix.length, size);
    assert.equal(matrix[0].length, size);

    const inv = inverseMatrixMod(matrix, m);
    const product = multiplyMod(matrix, inv, m);

    const identity = generateIdentityMatrix(size);

    assert.deepEqual(product, identity);
  }
});
