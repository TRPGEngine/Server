import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { graphqlKoa } from 'apollo-server-koa/dist/koaApollo';
import { generateSchemaHash } from 'apollo-server-core/dist/utils/schemaHash';
import memoizeOne from 'memoize-one';
import { isDev } from '../../utils/middleware';
import { auth } from '../../utils/jwtauth';
import { generateSchema } from '../graphql/generate-schema';
import { TRPGRouter, TRPGMiddleware } from 'trpg/core';

const router = new TRPGRouter();
const getSchema = memoizeOne((db) => generateSchema(db));

router.get('/graphql/playground', isDev(), (ctx) => {
  ctx.body = renderPlaygroundPage({ endpoint: '/core/graphql' });
});

const graphqlHandler: TRPGMiddleware = (ctx, next) => {
  const db = ctx.trpgapp.storage.db;
  const schema = getSchema(db);
  const schemaHash = generateSchemaHash(schema)

  return graphqlKoa({
    schema,
    schemaHash
  })(ctx as any, next);
}

router.get('/graphql', isDev(auth(['user', 'admin'])), graphqlHandler);
router.post('/graphql', isDev(auth(['user', 'admin'])), graphqlHandler);

export default router;
