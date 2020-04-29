import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

const data = fs.readFileSync(path.resolve(__dirname, '../output/dnd5e.md'), {
  encoding: 'utf8',
});
const list = data
  .split('====split====')
  .map(_.trim)
  .map((item) => {
    const [title, ...rest] = item.split('\n');
    const name = title.match(/^[\u4e00-\u9fa5]+?([A-Za-z ]+?)$/)[1];
    const content = rest.join('\n');

    return { title, name, content };
  });

// fs.writeJsonSync(path.resolve(__dirname, '../output/output.json'), list);

fs.mkdirpSync(path.resolve(__dirname, '../output/dnd5e'));
list.forEach((item) => {
  const content = `---
id: ${item.name}
title: ${item.title}
---

${item.content}
`;
  fs.writeFileSync(
    path.resolve(__dirname, '../output/dnd5e', `${item.name}.md`),
    content
  );
});
console.log('生成文件完毕。一共生成', list.length, '项');
