import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidV4 } from 'uuid';
import { logger } from '~middleware';
import { MainModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    logger: Logger,
  });

  // 使用反向代理or负载均衡后获取真实ip
  app.set('trust proxy', 1);
  // 防止在进入中间件前发生报错，无法生成reqId
  app.use((req, _, next) => {
    req.reqId = req.headers['X-Request-Id'] || uuidV4();
    req.reqIp = req.headers['X-Ip'] || '0.0.0.0';
    next();
  });
  // 避免请求包体过大问题（request entity too large）
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // swagger接口文档
  const options = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('swagger~')
    .setVersion('1.0.0')
    .addTag('xxx')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/swagger/api', app, document);

  // 防止暴力刷接口
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );
  app.use(logger);
  await app.listen(8080);
}
bootstrap();
