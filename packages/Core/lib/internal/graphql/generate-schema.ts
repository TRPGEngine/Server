import {
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLOutputType,
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
 * 添加配置项到query config
 * @param queryConfig 目标查询配置文件
 * @param modelCls 要处理的Sequelize模型
 * @param fields 生成的fields
 * @param isList 是否为列表
 * @param queryName 查询名
 * @param typeName 类型名
 * @param description 描述
 */
function appendQueryConfig(
  queryConfig: GraphQLObjectTypeConfig<any, any>,
  modelCls: typeof Model,
  fields: any,
  isList: boolean = false,
  queryName: string = modelCls.name,
  typeName: string = modelCls.name,
  description: string = '模型: ' + modelCls.tableName
) {
  if (isList) {
    queryName += '_list';
    typeName += '_list';
  }

  let type: GraphQLOutputType = new GraphQLObjectType({
    name: typeName,
    description,
    fields,
  });

  if (isList) {
    type = new GraphQLList(type);
  }

  _.set(queryConfig, ['fields', queryName], {
    type,
    args: Object.assign({}, defaultArgs(modelCls), defaultListArgs()),
    resolve: resolver(modelCls, { list: isList }),
  });
}

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

    // 加入单项查询
    appendQueryConfig(queryConfig, modelCls, fields, false);

    // 加入列表查询
    appendQueryConfig(queryConfig, modelCls, fields, true);
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType(queryConfig),
  });
}
