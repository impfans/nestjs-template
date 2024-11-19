import { Request } from 'express';
export interface ICtxRequest extends Request {
  reqId: string;
}
