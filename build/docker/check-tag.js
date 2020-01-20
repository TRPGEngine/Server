const execa = require('execa');
const _ = require('lodash');

/**
 * 获取最新的tag的信息
 */
exports.getLastTagInfo = function() {
  const { stdout, code } = execa.sync('git', [
    'for-each-ref',
    'refs/tags',
    '--sort=-refname',
  ]);

  if (code !== 0) {
    return null;
  }

  const lastRef = stdout.split('\n')[0];
  const tmp = lastRef.split(/\t|\s/);
  if (tmp[1] !== 'tag') {
    console.error('最后一条记录不是Tag, 请检查');
    return null;
  }
  const hash = tmp[0];
  const tag = tmp[2];

  return {
    hash,
    tag,
  };
};

/**
 * 获取当前的hash
 */
exports.getHeadHash = function() {
  const { stdout: hash } = execa.sync('git', ['rev-parse', 'HEAD']);

  return hash;
};
