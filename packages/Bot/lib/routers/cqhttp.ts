import { TRPGRouter } from 'trpg/core';
import { checkCQHTTPSignature } from '../middleware/checkCQHTTPSignature';
import { EventType } from '../../types/cqhttp';
const CQHTTPRouter = new TRPGRouter<{
  robotQQ?: string;
}>();

CQHTTPRouter.post('/post/event', checkCQHTTPSignature(), (ctx) => {
  const event: EventType = ctx.body;

  // TODO

  console.log(event);
});

export default CQHTTPRouter;
