import { Prisma } from '@prisma/client'
import { DbErrors, EHttpErrors, EResultErrors, GenericErrors, IErrorResponse, IResult, IResultCustomMetadata, Logger } from '.'

export class Result {
  static customMetadata: IResultCustomMetadata = {}

  /**
   * Success
   *
   * @param data {any} - Data Response
   *
   * @returns {IResult<any>}
   */
  static success(data: any): IResult<any> {
    if (!data) data = {}

    const response: IResult<any> = {
      code: data && typeof data === 'object' && data.hasOwnProperty('code') ? data.code : EHttpErrors.SUCCESS,
      reason: '',
      data: data && typeof data === 'object' && data.hasOwnProperty('data') ? data.data : data,
      success: true,
    }

    /* Checking if the `data` object has a property called `pagination`. If it does, it assigns the
   value of `data.pagination` to the `pagination` property of the `response` object. This is a way
   to conditionally add a property to an object. */
    if (data.hasOwnProperty('pagination')) response['pagination'] = data.pagination

    return response
  }

  /**
   * Log a Custom Error Response
   * This is useful if you want to add more information to the error logs.
   *
   * @param {any} error - The error object that you want to return to the user.
   * @param {any} [errorMetadata] - This is an optional parameter that you can pass to the function.
   *
   */
  static customError(error: any, errorMetadata?: any): IResult<any> {
    try {
      const customMetadata = { ...this.customMetadata }

      let errorResponse: IErrorResponse | undefined = undefined
      let reason: string = ''
      let overrideCode: EHttpErrors | undefined = undefined
      let overrideStatusResponse: boolean | undefined = undefined

      customMetadata.stack = undefined
      customMetadata.error = undefined

      if (typeof error === 'string') {
        errorResponse = GenericErrors.INTERNAL_SERVER

        customMetadata.error = errorResponse
        customMetadata.stack = { reason: error }

        reason = error
      } else if (error?.code && error?.detail && error?.message) {
        customMetadata.error = { ...(error as IErrorResponse) }

        reason = error.message

        errorResponse = error as IErrorResponse

        // If the error is custom internal error, show to the user the Internal Server Error but keep the logs in metadata
        if (error.custom_internal_error) errorResponse = GenericErrors.INTERNAL_SERVER

        overrideCode = errorResponse.overrideCode
        overrideStatusResponse = errorResponse.overrideStatusResponse

        delete errorResponse.overrideCode
        delete errorResponse.overrideStatusResponse
        delete errorResponse.custom_internal_error
        delete errorResponse.internalMessage
      } else if (error?.error?.code && error?.error?.detail && error?.error?.message) {
        customMetadata.error = { ...(error.error as IErrorResponse) }

        reason = error.error.message

        errorResponse = error.error as IErrorResponse

        // If the error is custom internal error, show to the user the Internal Server Error but keep the logs in metadata
        if (error.error.custom_internal_error) errorResponse = GenericErrors.INTERNAL_SERVER
      } else {
        customMetadata.stack = error

        errorResponse = GenericErrors.INTERNAL_SERVER

        reason = errorResponse.message
      }

      if (errorMetadata) errorResponse.metadata = errorMetadata

      Logger.init().error(errorResponse.message, { ...customMetadata })

      return {
        error: errorResponse,
        code: overrideCode ?? EHttpErrors.BAD_REQUEST,
        reason: reason,
        data: {},
        success: !overrideStatusResponse ?? true,
      }
    } catch (err) {
      return {
        error: GenericErrors.INTERNAL_SERVER,
        code: EHttpErrors.INTERNAL_SERVER_ERROR,
        reason: `Internal Server Error | Error: ${err}`,
        data: {},
        success: false,
      }
    }
  }

  /**
   * Log a Info Message
   *
   * @param message {string}
   * @param metadata {any}
   */
  static info(message: string, metadata?: any): void {
    const customMetadata = { ...(metadata && { ...metadata }), ...this.customMetadata }

    Logger.init().info(message, customMetadata)
  }

  /**
   * Log a Debug Message
   *
   * @param message {string}
   * @param metadata {any}
   */
  static debug(message: string, metadata?: any): void {
    const customMetadata = { ...(metadata && { ...metadata }), ...this.customMetadata }

    Logger.init().debug(message, customMetadata)
  }

  /**
   * Log a Warning Message
   *
   * @param message {string}
   * @param metadata {any}
   */
  static warning(message: string, metadata?: any): void {
    const customMetadata = { ...(metadata && { ...metadata }), ...this.customMetadata }

    Logger.init().warning(message, customMetadata)
  }

  /**
   * Log a Verbose Message
   *
   * @param message {string}
   * @param metadata {any}
   */
  static verbose(message: string, metadata?: any): void {
    const customMetadata = { ...(metadata && { ...metadata }), ...this.customMetadata }

    Logger.init().verbose(message, customMetadata)
  }

  /**
   * Log an error
   *
   * @param error {any} - Error Data Response
   * @param format {string} - Format to parse external error handlers for response consistency
   * @param success {boolean} - Internal business logic error vs. top level network error
   *
   * @returns {IResult<any>}
   */
  static error(error: any, format?: EResultErrors, success: boolean = true): IResult<any> {
    let response: IResult<any>

    try {
      this.customMetadata.error = {}

      this.customMetadata.stack = undefined

      // Error Format Logic
      switch (format) {
        case EResultErrors.DataBase:
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const e = error as Prisma.PrismaClientKnownRequestError

            response = DbErrors.getDbError(e)
          } else {
            response = {
              error: true,
              code: error && typeof error === 'object' && error.hasOwnProperty('code') ? error.code : EHttpErrors.BAD_REQUEST,
              reason: error && typeof error === 'object' && error.hasOwnProperty('reason') ? error.reason : error ?? '',
              data: {},
              success: false,
            }
          }
          Logger.init().error(response.reason, { ...this.customMetadata })

          return response
        case EResultErrors.Message:
        case EResultErrors.Result:
          response = {
            error: true,
            code: error && typeof error === 'object' && error.hasOwnProperty('code') ? error.code : EHttpErrors.BAD_REQUEST,
            reason:
              error && typeof error === 'object' && error.hasOwnProperty('reason')
                ? error.reason
                : error && typeof error === 'object' && error.hasOwnProperty('name')
                ? error.name
                : error ?? '',
            data: {},
            success: error && typeof error === 'object' && error.hasOwnProperty('success') ? error.success : success,
          }

          Logger.init().error(response.reason, { ...this.customMetadata })

          return response
        default:
          response = {
            error: true,
            code: error && typeof error === 'object' && error.hasOwnProperty('code') ? error.code : EHttpErrors.BAD_REQUEST,
            reason:
              error && typeof error === 'object' && error.hasOwnProperty('reason')
                ? error.reason
                : error && typeof error === 'object' && error.hasOwnProperty('name')
                ? error.name
                : error ?? '',
            data: {},
            success: error && typeof error === 'object' && error.hasOwnProperty('success') ? error.success : success,
          }

          Logger.init().error(response.reason, { ...this.customMetadata })

          return response
      }
    } catch (err) {
      response = {
        error: true,
        code: EHttpErrors.INTERNAL_SERVER_ERROR,
        reason: `Internal Server Error | Error: ${err}`,
        data: {},
        success: false,
      }

      return response
    }
  }
}
