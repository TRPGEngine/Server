import { TRPGRouter } from 'trpg/core';
import { FileDocument } from '../models/document';

const documentRouter = new TRPGRouter();

documentRouter.get('/document/list', async (ctx) => {
  const list = await FileDocument.getDocList();

  ctx.body = {
    list,
  };
});

documentRouter.get('/document/view/:uuid', async (ctx) => {
  const uuid = ctx.params.uuid;
  const link = await FileDocument.viewDocumentLink(uuid);

  ctx.body = { link };
});

export default documentRouter;
