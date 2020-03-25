import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { TRPGGameReport } from '../models/game-report';
const gameReportRouter = new TRPGRouter();

gameReportRouter.post('/game-report/create', async function(ctx) {
  const { title, cast, content } = ctx.request.body;

  if (_.isNil(title)) {
    throw new Error('缺少必要字段');
  }

  const report = await TRPGGameReport.generateGameReport(title, cast, content);

  ctx.body = { uuid: report.uuid };
});

gameReportRouter.get('/game-report/:reportUUID', async (ctx) => {
  const reportUUID = ctx.params.reportUUID;

  const report = await TRPGGameReport.findByUUID(reportUUID);

  ctx.body = { report };
});

export default gameReportRouter;
