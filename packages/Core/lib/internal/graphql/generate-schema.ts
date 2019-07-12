import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLObjectTypeConfig,
} from 'graphql';
import { Sequelize, Model } from 'sequelize';
import {
  resolver,
  attributeFields,
  defaultListArgs,
  defaultArgs,
} from 'graphql-sequelize';
import _ from 'lodash';

interface FieldsType {
  [name: string]: {
    type: GraphQLScalarType;
  };
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
