import { getObjectLeaf } from '../object-helper';

describe('object-helper', () => {
  describe('getObjectLeaf', () => {
    test.each([
      [
        {
          a: 1,
        },
        [{ path: 'a', value: 1 }],
      ],
      [
        { a: 1, b: 2 },
        [
          { path: 'a', value: 1 },
          { path: 'b', value: 2 },
        ],
      ],
      [
        { a: 1, b: 2, c: { d: 4, e: 5 } },
        [
          { path: 'a', value: 1 },
          { path: 'b', value: 2 },
          { path: 'c.d', value: 4 },
          { path: 'c.e', value: 5 },
        ],
      ],
      [
        { a: 1, b: 2, c: { d: 4, e: 5, f: { g: 7, h: 8 } } },
        [
          { path: 'a', value: 1 },
          { path: 'b', value: 2 },
          { path: 'c.d', value: 4 },
          { path: 'c.e', value: 5 },
          { path: 'c.f.g', value: 7 },
          { path: 'c.f.h', value: 8 },
        ],
      ],
      [
        { a: [1, 2, 3] },
        [
          { path: 'a.0', value: 1 },
          { path: 'a.1', value: 2 },
          { path: 'a.2', value: 3 },
        ],
      ],
      [
        {
          a: [
            1,
            {
              b: 2,
            },
            3,
          ],
        },
        [
          { path: 'a.0', value: 1 },
          { path: 'a.1.b', value: 2 },
          { path: 'a.2', value: 3 },
        ],
      ],
      [
        1,
        [
          {
            path: '',
            value: 1,
          },
        ],
      ],
      [
        [1, 2],
        [
          {
            path: '0',
            value: 1,
          },
          {
            path: '1',
            value: 2,
          },
        ],
      ],
    ])('%o => %p', (input, output: any) => {
      const leafs = getObjectLeaf(input);

      expect(leafs).toMatchObject(output);
    });
  });
});
