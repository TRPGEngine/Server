import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { graphqlKoa } from 'apollo-server-koa/dist/koaApollo';
import memoizeOne from 'memoize-one';
import { isDev } from '../../utils/middleware';
import { auth } from '../../utils/jwtauth';
import { generateSchema } from '../graphql/generate-schema';
import { TRPGRouter } from 'trpg/core';

const router = new TRPGRouter();
const getSchema = memoizeOne((db) => generateSchema(db));

router.get('/graphql/playground', isDev(), (ctx) => {
  ctx.body = renderPlaygroundPage({ endpoint: '/core/graphql' });
});

router.get('/graphql', isDev(auth(['user', 'admin'])), (ctx, next) => {
  const db = ctx.trpgapp.storage.db;
  const schema = getSchema(db);

  return graphqlKoa({
    schema,
  })(ctx as any, next);
});

router.post('/graphql', isDev(auth(['user', 'admin'])), (ctx, next) => {
  const db = ctx.trpgapp.storage.db;
  const schema = getSchema(db);

  return graphqlKoa({
    schema,
  })(ctx as any, next);
});

export default router;
