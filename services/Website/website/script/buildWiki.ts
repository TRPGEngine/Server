import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';

const wikiDir = path.resolve(__dirname, '../../docs/wiki');

console.log('正在检查wiki文件夹...');

/**
 * 不获取根目录下的md文件。比如README.md
 */
const fileList = glob
  .sync(path.resolve(wikiDir, './*/**/*.md'))
  .map((p) => path.relative(wikiDir, p))
  .map((p) => path.dirname(p) + path.sep + path.basename(p, path.extname(p)))
  .map(path.normalize);

/**
 * 最上级的视为分类，其他的则是id
 */
const list = fileList.map((name) => {
  const [catalog] = name.split(path.sep);

  return { name, catalog };
});
const info = _.mapValues(
  _.groupBy(list, (item) => item.catalog),
  (x) => _.map(x, 'name').map((n) => `wiki/${n}`)
);

console.log('生成完毕, 正在写入JSON');
const targetPath = path.resolve(wikiDir, '_list.json');
fs.writeJSONSync(targetPath, info);
console.log('写入完毕:', targetPath);
