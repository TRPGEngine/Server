import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLEnumType,
} from 'graphql';
import { Sequelize, Model, ENUM, DataType } from 'sequelize';
import {
  resolver,
  attributeFields,
  defaultListArgs,
  defaultArgs,
  typeMapper,
} from 'graphql-sequelize';
import _ from 'lodash';
import { toPinyin } from '../../utils/pinyin';

typeMapper.mapType((type: DataType) => {
  if (type instanceof ENUM) {
    return new GraphQLEnumType({
      name: 'tempEnumName',
      values: _(type.values)
        .mapKeys((value) => {
          return value
            .trim()
            .replace(/([^_a-zA-Z0-9])/g, (_, p) => toPinyin(p) || ' ') // 转化类型时中文需要转化为拼音
            .split(' ')
            .map((v, i) => (i ? _.upperFirst(v) : v))
            .join('')
            .replace(/(^\d)/, '_$1');
        })
        .mapValues((v) => ({ value: v }))
        .value(),
    });
  }

  return false;
});
/**
 * 根据sequelize实例数据生成一个对应的Schema
 * @param db sequelize实例
 */
export function generateSchema(db: Sequelize): GraphQLSchema {
  const models = db.models;
  const queryConfig: GraphQLObjectTypeConfig<any, any> = {
    name: 'RootQueryType',
    fields: {},
  };
  _.forEach(models, (modelCls: typeof Model, modelName: string) => {
    const fields = attributeFields(modelCls);
    const type = new GraphQLObjectType({
      name: modelCls.name,
      description: modelCls.tableName,
      fields,
    });

    _.set(queryConfig, ['fields', modelName], {
      type,
      args: Object.assign({}, defaultArgs(modelCls), defaultListArgs()),
      resolve: resolver(modelCls),
    });
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType(queryConfig),
  });
}
