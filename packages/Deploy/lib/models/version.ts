import { Model, DBInstance, Orm } from 'trpg/core';
import semver from 'semver';
import _ from 'lodash';

export type DeployVersionPlatform =
  | 'android'
  | 'ios'
  | 'windows'
  | 'mac'
  | 'linux';

export class DeployVersion extends Model {
  version: string;
  platform: DeployVersionPlatform;
  download_url: string;
  describe: string;

  /**
   * 获取指定版本号
   * @param version 版本号，必须符合semver标准如1.0.0
   */
  static findByVersion(version: string): Promise<DeployVersion> {
    if (_.isNull(semver.valid(version))) {
      throw new Error(`cant find version with a invalid version :${version}`);
    }

    return DeployVersion.findOne({
      where: {
        version,
      },
    });
  }

  /**
   * 获取所有发布版本数据并获取版本号最大的一条作为最新记录
   * TODO: 可能需要增加缓存
   */
  static async findLatestVersion(
    platform: DeployVersionPlatform = 'android'
  ): Promise<DeployVersion> {
    const allVersions: DeployVersion[] = await DeployVersion.findAll({
      where: {
        platform,
      },
    });

    const sortedVersions = allVersions.sort((a, b) =>
      semver.gt(a.version, b.version) ? 1 : -1
    ); // 从小到大排列后的数据
    return _.last(sortedVersions);
  }
}

export default function DeployVersionDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  DeployVersion.init(
    {
      version: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isValidSemver: (value: string) => !_.isNull(semver.valid(value)),
        },
      },
      platform: {
        type: Sequelize.ENUM('android', 'ios', 'windows', 'mac', 'linux'),
        allowNull: false,
      },
      download_url: {
        type: Sequelize.STRING,
        comment: '二进制文件完整下载地址',
      },
      describe: {
        type: Sequelize.TEXT,
        comment: '版本更新内容',
      },
    },
    {
      tableName: 'deploy_version',
      sequelize: db,
      paranoid: true,
      updatedAt: false,
    }
  );

  return DeployVersion;
}
