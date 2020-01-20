const execa = require('execa');
const path = require('path');
const package = require('../../package.json');
const { getLastTagInfo, getHeadHash } = require('./check-tag');

const version = package.version;

console.log('Building TRPG Engine Docker Image:', version, '...');

try {
  const tagInfo = getLastTagInfo();
  const commitHash = getHeadHash();

  if (tagInfo === null) {
    throw new Error('获取tag信息失败');
  }

  if (tagInfo.hash !== commitHash) {
    throw new Error(
      '当前commit与最新的tag不匹配，请先允许 npm run release 进行发布'
    );
  }

  execa.sync(
    'docker',
    [
      'build',
      path.resolve(__dirname, '../../'),
      '--tag',
      version,
      '--build-arg',
      `GIT_COMMIT=${commitHash}`,
    ],
    {
      stdout: process.stdout,
      stderr: process.stderr,
    }
  );

  // TODO
} catch (err) {
  console.log('\n=================\n');
  console.log('Build Failed:\n', err);
}
