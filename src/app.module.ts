import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { envConfig } from '~config';
import { controllers } from '~controllers';
import { AllExceptionsFilter } from '~filters';
import { ResponseInterceptor } from '~interceptor';
import { services } from '~services';
import { ValidationPipe } from '~utils';

const common = [...services];
const middleware = [
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseInterceptor,
  },
  {
    provide: APP_PIPE,
    useClass: ValidationPipe,
  },
];

const imports = [
  ConfigModule.forRoot({
    load: [envConfig],
    isGlobal: true,
  }),
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...common, ...middleware],
})
export class MainModule {}
