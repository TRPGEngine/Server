import KoaRouter, { IMiddleware } from 'koa-router';
import { TRPGApplication } from './app';

export type State = any;
export interface Context {
  trpgapp: TRPGApplication;
}

export class Router extends KoaRouter<State, Context> {}
export type Middleware = IMiddleware<State, Context>;
