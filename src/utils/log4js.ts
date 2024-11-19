import * as Path from 'path';
import * as Log4js from 'log4js';
import * as Util from 'util';
import moment from 'moment';
import * as StackTrace from 'stacktrace-js';
import Chalk from 'chalk';
import { log4jsConfig } from '~config';
// 日志级别
export enum LoggerLevel {
  ALL = 'ALL',
  MARK = 'MARK',
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
  OFF = 'OFF',
}

// 内容跟踪类
export class ContextTrace {
  constructor(
    public readonly context: string,
    public readonly path?: string,
    public readonly lineNumber?: number,
    public readonly columnNumber?: number,
  ) {}
}

Log4js.addLayout('Awesome-nest', (logConfig: any) => {
  return (logEvent: Log4js.LoggingEvent): string => {
    let moduleName = '';
    let position = '';

    // 日志组装
    const messageList: string[] = [];
    logEvent.data.forEach((value: any) => {
      if (value instanceof ContextTrace) {
        moduleName = value.context;
        // 显示触发日志的坐标（行，列）
        if (value.lineNumber && value.columnNumber) {
          position = `${value.lineNumber}, ${value.columnNumber}`;
        }
        return;
      }

      if (typeof value !== 'string') {
        value = Util.inspect(value, false, 3, true);
      }

      messageList.push(value);
    });

    // 日志组成部分
    const messageOutput: string = messageList.join(' ');
    const positionOutput: string = position ? ` [${position}]` : '';
    const typeOutput = `[${logConfig.type}] ${logEvent.pid.toString()}   - `;
    const dateOutput = `${moment(logEvent.startTime).format(
      'YYYY-MM-DD HH:mm:ss',
    )}`;
    const moduleOutput: string = moduleName
      ? `[${moduleName}] `
      : '[LoggerService] ';
    let levelOutput = `[${logEvent.level}] ${messageOutput}`;

    // 根据日志级别，用不同颜色区分
    switch (logEvent.level.toString()) {
      case LoggerLevel.DEBUG:
        levelOutput = Chalk.green(levelOutput);
        break;
      case LoggerLevel.INFO:
        levelOutput = Chalk.cyan(levelOutput);
        break;
      case LoggerLevel.WARN:
        levelOutput = Chalk.yellow(levelOutput);
        break;
      case LoggerLevel.ERROR:
        levelOutput = Chalk.red(levelOutput);
        break;
      case LoggerLevel.FATAL:
        levelOutput = Chalk.hex('#DD4C35')(levelOutput);
        break;
      default:
        levelOutput = Chalk.grey(levelOutput);
        break;
    }

    return `${Chalk.green(typeOutput)}${dateOutput}  ${Chalk.yellow(
      moduleOutput,
    )}${levelOutput}${positionOutput}`;
  };
});

// 注入配置
Log4js.configure(log4jsConfig);

// 实例化
const logger = Log4js.getLogger();
// logger.level = LoggerLevel.TRACE;
export class Logger {
  static trace(traceId, args) {
    logger.level = LoggerLevel.TRACE;
    logger.trace(Logger.getStackTrace(traceId), args);
  }

  static debug(traceId, args) {
    logger.level = LoggerLevel.DEBUG;

    logger.debug(Logger.getStackTrace(traceId), args);
  }

  static info(traceId, args) {
    logger.level = LoggerLevel.INFO;
    logger.info(Logger.getStackTrace(traceId), args);
  }

  static warn(traceId, args) {
    logger.level = LoggerLevel.WARN;
    logger.warn(Logger.getStackTrace(traceId), args);
  }

  static error(traceId, args) {
    logger.level = LoggerLevel.ERROR;
    logger.error(Logger.getStackTrace(traceId), args);
  }

  static fatal(traceId, args) {
    logger.level = LoggerLevel.FATAL;
    logger.fatal(Logger.getStackTrace(traceId), args);
  }

  static access(traceId, args) {
    logger.level = LoggerLevel.INFO;
    const loggerCustom = Log4js.getLogger('http');
    loggerCustom.info(Logger.getStackTrace(traceId), args);
  }
  static mysql(traceId, args) {
    logger.level = LoggerLevel.INFO;
    const loggerCustom = Log4js.getLogger('mysql');
    loggerCustom.info(Logger.getStackTrace(traceId), args);
  }
  // 日志追踪，可以追溯到哪个文件、第几行第几列
  static getStackTrace(traceId): string {
    const stackList: StackTrace.StackFrame[] = StackTrace.getSync();
    const stackInfo: StackTrace.StackFrame = stackList[2];
    const lineNumber: number = stackInfo.lineNumber;
    const columnNumber: number = stackInfo.columnNumber;
    const fileName: string = stackInfo.fileName;
    const basename: string = Path.basename(fileName);
    return `[requestId:${traceId}] ${basename}(line: ${lineNumber}, column: ${columnNumber}): \n`;
  }
}
