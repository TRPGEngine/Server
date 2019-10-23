import { Model, Orm, DBInstance } from 'trpg/core';

class FileDocument extends Model {
  uuid: string;
  name: string;
  link: string;
  views: string;

  static getDocList(
    page: number = 1,
    size: number = 20
  ): Promise<Omit<FileDocument, 'link'>[]> {
    return FileDocument.findAll({
      attributes: ['uuid', 'name', 'views'],
      limit: size,
      offset: (page - 1) * size,
    });
  }

  /**
   * 查看连接并查看数+1
   * @param uuid UUID
   */
  static async viewDocumentLink(uuid: string): Promise<string> {
    const doc: FileDocument = await FileDocument.findOne({ where: { uuid } });
    const link = doc.link;

    // 访问数加一
    doc.increment('views');

    return link;
  }
}

export default function FileDocumentDefinition(Sequelize: Orm, db: DBInstance) {
  FileDocument.init(
    {
      uuid: {
        type: Sequelize.UUID,
        required: true,
        defaultValue: Sequelize.UUIDV1,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      link: {
        type: Sequelize.STRING,
        required: true,
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize: db,
      tableName: 'file_document',
    }
  );

  return FileDocument;
}
