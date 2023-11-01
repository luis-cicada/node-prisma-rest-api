import winston from 'winston'
import { Format } from 'logform'
import * as Transport from 'winston-transport'
import { Result } from '.'

/**
 * Logger class
 */
export class Logger {
  private static winstonLogger: winston.Logger

  public static colors = {
    error: 'red',
    warn: 'magenta',
    info: 'yellow',
    verbose: 'cyan',
    debug: 'blue',
  }

  /**
   * Get Logging Level
   *
   * @returns {string}
   */
  static getLevel(): string {
    return process.env.STAGE === 'prod' ? 'info' : 'debug'
  }

  /**
   * Get Format
   *
   * @returns {Format}
   */
  static getFormat(): Format {
    const service = process.env.SERVICE ?? 'Service Not Set'
    const fn = process.env.LABEL ?? 'Label Not Set'

    return winston.format.combine(
      winston.format.label({ label: `${service} | ${fn}` }),
      winston.format.prettyPrint(),
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      winston.format.printf((info) => {
        info.level = info.level.toUpperCase()

        return JSON.stringify(info)
      }),
    )
  }

  /**
   * Get Transports
   *
   * @returns {Transport[]}
   */
  static getTransports(): Transport[] {
    const consoleTransport = process.env.IS_OFFLINE
      ? new winston.transports.Console({
          format: winston.format.combine(winston.format.prettyPrint(), winston.format.colorize({ all: true, colors: Logger.colors })),
        })
      : new winston.transports.Console()

    return [consoleTransport]
  }

  /**
   * Get instance of logger
   *
   * @returns {winston.Logger}
   */
  public static init(): winston.Logger {
    if (!Logger.winstonLogger) {
      winston.addColors(Logger.colors)

      Logger.winstonLogger = winston.createLogger({
        level: Logger.getLevel(),
        exitOnError: false,
        format: Logger.getFormat(),
        transports: Logger.getTransports(),
      })
    }

    return Logger.winstonLogger
  }

  /**
   * Log a Info Message
   *
   * @param {string} message
   * @param {any} metadata
   */
  static info(message: string, metadata?: any): void {
    Result.info(message, metadata)
  }

  /**
   * Log a Debug Message
   *
   * @param {string} message
   * @param {any} metadata
   */
  static debug(message: string, metadata?: any): void {
    Result.debug(message, metadata)
  }

    /**
   * Log a Warning Message
   *
   * @param {string} message
   * @param {any} metadata
   */
    static warning(message: string, metadata?: any): void {
      Result.warning(message, metadata)
    }

  /**
   * Log a Verbose Message
   *
   * @param {string} message
   * @param {any} metadata
   */
  static verbose(message: string, metadata?: any): void {
    Result.verbose(message, metadata)
  }
}
