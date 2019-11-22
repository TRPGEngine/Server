import md5Encrypt from 'packages/Player/lib/utils/md5';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import memoizeOne from 'memoize-one';

const testPlayerInfo = {
  username: 'admin10',
  password: md5Encrypt('admin'),
};

/**
 * 获取测试用户
 */
export const getTestPlayer = memoizeOne(async () => {
  return await PlayerUser.findByUsernameAndPassword(
    testPlayerInfo.username,
    testPlayerInfo.password
  );
});

/**
 * 生成测试用户的JWT
 */
export const genTestPlayerJWT = async (): Promise<string> => {
  const player = await getTestPlayer();
  const playerUUID = player.uuid;
  const jwt = await PlayerUser.signJWT(playerUUID);

  return jwt;
};
