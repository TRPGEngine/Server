import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';

const docDir = path.resolve(__dirname, '../../docs');
const sidebars = require('../sidebars');

const newDocTemplate = (id: string) => `---
id: ${id}
title: ${id}
---

## ${id}
`;

console.log('正在检查doc文件夹...');
const fileList = glob
  .sync(path.resolve(docDir, './**/*.md'))
  .map((p) => path.relative(docDir, p))
  .map((p) => path.dirname(p) + path.sep + path.basename(p, path.extname(p)))
  .map(path.normalize);
const getLeafs = (obj: any) => {
  return _.values(obj).map((item) => {
    if (typeof item === 'object' && !Array.isArray(item)) {
      // 是{}
      if (typeof item.type !== 'undefined') {
        return null;
      }
      return getLeafs(item);
    }
    if (Array.isArray(item)) {
      // 是[]
      return item.map((i) => {
        if (typeof i === 'object') {
          if (typeof i.type !== 'undefined') {
            return null;
          }
          return getLeafs(item);
        }

        return i;
      });
    }
    return item;
  });
};
const required = _.flattenDeep(getLeafs(sidebars)).filter(_.isString);

console.log('doc文件数:', fileList.length);
console.log('sidebar文件数:', required.length);

console.log('开始比较并生成需要文件...');
let count = 0;
required.forEach((r) => {
  const filename = r + '.md';
  console.log('检查文件:', filename);

  if (!fileList.includes(r)) {
    const id = _.last(r.split(path.sep));
    const fp = path.resolve(docDir, './', filename);
    if (!fs.pathExistsSync(fp)) {
      fs.createFileSync(fp);
      fs.writeFileSync(fp, newDocTemplate(_.last(id)), { encoding: 'utf8' });
      console.log('文件生成完毕,id:', id);
      count++;
    } else {
      console.log('异常: 文件已存在');
    }
  }
});

if (count > 0) {
  console.log(`构建完毕, 创建${count}个文件`);
} else {
  console.log('检查完毕, 不需要创建新文件');
}
