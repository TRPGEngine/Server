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
  const catalog = name.split(path.sep);
  catalog.pop(); // 移除最后的文件名。前面都是分类

  return { name, catalog };
});

const info = { items: [] };
function setInfo(target: any, catalogs: string[], item: string) {
  const [currentCatalog, ...restCatalog] = catalogs;
  let c = _.find(target.items, ['label', currentCatalog]);
  if (_.isNil(c)) {
    c = {
      type: 'category',
      label: currentCatalog,
      items: [],
    };
    target.items.push(c);
  }

  if (restCatalog.length > 0) {
    setInfo(c, restCatalog, item);
  } else {
    c.items.push(item);
  }
}
list.forEach((item) => {
  const name = `wiki/${item.name}`.replace(new RegExp('\\\\', 'g'), '/'); // 强制转换window下的\\

  setInfo(info, item.catalog, name);
});

console.log('生成完毕, 正在写入JSON');
const targetPath = path.resolve(wikiDir, '_list.json');
fs.writeJSONSync(targetPath, info.items);
console.log('写入完毕:', targetPath);
