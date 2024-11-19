import { Response } from 'express';
import moment from 'moment';
import { ICtxRequest } from '~interfaces';
import { Logger } from '~utils';

// 函数式中间件
export function logger(req: ICtxRequest, res: Response, next: () => any) {
  const code = res.statusCode; // 响应状态码
  next();
  // 组装日志信息
  const logFormat = ` >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    请求参数
    timestamp: ${moment().format('YYYY-MM-DD HH:mm:ss')}
    requestId: ${req.reqId},
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${req.ip}
    Status code: ${code}
    Params: ${JSON.stringify(req.params)}
    Query: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(
      req.body,
    )} \n  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  `;
  // 根据状态码，进行日志类型区分
  if (code >= 500) {
    Logger.error(req.reqId || '', logFormat);
  } else if (code >= 400) {
    Logger.warn(req.reqId || '', logFormat);
  } else {
    Logger.access(req.reqId || '', logFormat);
  }
}
