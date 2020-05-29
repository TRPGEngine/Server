import { getPackageDependsGraph, SimplePackage } from '../dependency-helper';
import _ from 'lodash';

describe('dependency-helper', () => {
  describe('getPackageDependsGraph', () => {
    const allPackages: SimplePackage[] = [
      {
        name: 'a',
        required: [],
      },
      {
        name: 'b',
        required: ['a'],
      },
      {
        name: 'c',
        required: ['b'],
      },
      {
        name: 'd',
        required: ['a', 'b'],
      },
      {
        name: 'e',
        required: ['a', 'd'],
      },
      {
        name: 'f',
        required: ['c', 'd'],
      },
    ];

    describe.each([
      [
        ['a', 'b', 'c'],
        ['a', 'b', 'c'],
      ],
      [
        ['a', 'b', 'd'],
        ['a', 'b', 'd'],
      ],
      [
        ['a', 'b', 'f'],
        ['a', 'b', 'd', 'c', 'f'],
      ],
      [
        ['a', 'b', 'c', 'f'],
        ['a', 'b', 'd', 'c', 'f'],
      ],
      [
        ['a', 'b', 'e'],
        ['a', 'b', 'd', 'e'],
      ],
    ])('%s => %s', (loadNames, expectGraph) => {
      test('normal load', () => {
        const graph = getPackageDependsGraph(loadNames, allPackages);
        expect(graph).toMatchObject(expectGraph);
      });

      const shuffleLoad = _.shuffle(loadNames);
      test(`shuffle case: ${shuffleLoad}`, () => {
        const graph = getPackageDependsGraph(shuffleLoad, allPackages);
        // 打乱顺序的测试结果顺序应当是实际与期望去除中间依赖后顺序相同
        expect(graph.filter((g) => loadNames.includes(g))).toMatchObject(
          expectGraph.filter((g) => loadNames.includes(g))
        );
      });
    });
  });
});
