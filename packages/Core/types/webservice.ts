import KoaRouter, { IRouterParamContext } from 'koa-router';
import { TRPGApplication } from './app';
import { DefaultContext, Middleware, DefaultState } from 'koa';

export type TRPGRouterState = DefaultState;
export interface TRPGRouterContext extends DefaultContext {
  session: any;
  sessionOptions: any;
  trpgapp: TRPGApplication;
}

export class TRPGRouter<
  S extends TRPGRouterState = TRPGRouterState,
  C extends TRPGRouterContext = TRPGRouterContext
> extends KoaRouter<S, C> {}

export type TRPGMiddleware<
  S extends TRPGRouterState = TRPGRouterState,
  C extends TRPGRouterContext = TRPGRouterContext
> = Middleware<
  DefaultState & S,
  TRPGRouterContext & IRouterParamContext<DefaultState, C>
>;
