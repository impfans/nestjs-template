/**
 * 自定义返回信息
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICtxRequest } from '~interfaces';
import { Logger } from '~utils';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest() as ICtxRequest;
      const res = context.switchToHttp().getResponse() as Response;
      const now = Date.now();
      return next.handle().pipe(
        map((result) => {
          const logFormat = `
            requestId: ${req.reqId}
            result: ${JSON.stringify(result)}
            code: res.statusCode,
            time: ${Date.now() - now}ms
            `;
          Logger.access(req.reqId, logFormat);
          return {
            code: res.statusCode === 201 ? 200 : res.statusCode,
            result: result ? result : null,
            reqId: req.reqId,
          };
        }),
      );
    }
    // 其他类型服务请求保持原格式
    return next.handle().pipe(map((res) => res));
  }
}
