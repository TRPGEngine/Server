/**
 * 处理依赖的帮助函数
 */

import _ from 'lodash';

export interface SimplePackage {
  name: string;
  required?: string[];
}

/**
 * 数组去重。只保留最右侧的顺序
 */
function uniqRight(list: string[]): string[] {
  return _(list)
    .reverse()
    .uniq()
    .reverse()
    .value();
}

function getPackageAllDependencies(
  packageName: string,
  allPackages: SimplePackage[]
): string[] {
  const info = _.find(allPackages, ['name', packageName]);

  const required = info.required ?? [];

  const depends: string[] = [packageName];
  for (const r of required) {
    depends.push(...getPackageAllDependencies(r, allPackages));
  }

  return depends;
}

/**
 * 获取依赖图
 * @param loadPackageNames 加载的包的名字列表
 * @param allPackages 所有的包
 * @returns 解析后的加载顺序
 */
export function getPackageDependsGraph(
  loadPackageNames: string[],
  allPackages: SimplePackage[]
): string[] {
  const depends: string[] = [];
  for (const packageName of loadPackageNames) {
    depends.push(...getPackageAllDependencies(packageName, allPackages));
  }

  return _.reverse(uniqRight(depends));
}
