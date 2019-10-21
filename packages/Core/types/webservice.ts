import KoaRouter, { IMiddleware, IRouterParamContext } from 'koa-router';
import { TRPGApplication } from './app';
import { DefaultContext, Middleware, DefaultState } from 'koa';

export type TRPGRouterState = DefaultState;
export interface TRPGRouterContext extends DefaultContext {
  session: any;
  sessionOptions: any;
  trpgapp: TRPGApplication;
}

export class TRPGRouter extends KoaRouter<TRPGRouterState, TRPGRouterContext> {}
export type TRPGMiddleware = Middleware<
  DefaultState & TRPGRouterState,
  TRPGRouterContext & IRouterParamContext<DefaultState, TRPGRouterContext>
>;
