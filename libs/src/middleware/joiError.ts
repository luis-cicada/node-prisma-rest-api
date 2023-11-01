import { NextFunction, Response } from 'express'
import { CORS_SETTINGS, EResultErrors, IRequestWithOptions, Result } from '..'

/**
 * Middleware For Joi Errors
 *
 * @param err {any} - The error that comes from express
 * @param res {Response}
 * @param next {NextFunction}
 *
 * @exports
 */
export const joiError = (err: any, _: IRequestWithOptions, res: Response, next: NextFunction) => {
  try {
    if (err && err.error && err.error.isJoi) {
      res.set(CORS_SETTINGS)

      const error = {
        error: {
          code: 'ENTITY_ERROR',
          message: 'There is an error in the payload sent',
          detail: err.error.toString().replace(/\\/g, ''),
        },
        code: 422,
        reason: err.error.toString().replace(/\\/g, ''),
        data: err.type,
        success: true,
      }

      Result.error(error)

      res.status(422).json(error)
    } else {
      next(err)
    }
  } catch (error) {
    res.status(500).json(Result.error(error, EResultErrors.Message, false))
  }
}
