import Pdf from './helper';
import fs from 'fs';

const origin = './origin/input.pdf';
const output = './output/output.txt';

console.log('正在读取文件...');
const dataBuffer = fs.readFileSync(origin);
console.log('文件读取完毕, 开始解析');

Pdf(dataBuffer)
  .then(function(data) {
    fs.writeFileSync(output, data.text, {
      encoding: 'utf8',
      flag: 'w',
    });
    console.log('文件生成完毕');
  })
  .catch(function(error) {
    console.error('error', error.message);
  });
