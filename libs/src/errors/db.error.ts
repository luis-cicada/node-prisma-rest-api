import { Prisma } from '@prisma/client'
import { EHttpCodes, IResult } from '../types'

export class DbErrors {
  static getDbError(error: Prisma.PrismaClientKnownRequestError): IResult<any> {
    switch (error.code) {
      case 'P1000':
        return this.buildDbError(
          `Authentication failed against database server. The provided database credentials are not valid. Please make sure to provide valid database credentials for the database server.`,
        )
      case 'P1001':
        return this.buildDbError(`Can't reach database server. Please make sure your database server is running.`)
      case 'P1002':
        return this.buildDbError(`The database server was reached but timed out.`)
      case 'P1003':
        return this.buildDbError(`Database does not exist on the database server.`)
      case 'P1008':
        return this.buildDbError(`perations timed out.`)
      case 'P2002':
        return this.buildDbError(`Unique constraint failed on the ${error?.meta?.target}. Please check your input data and try again.`)
      case 'P2012':
        return this.buildDbError(`Missing a required value.`)
      case 'P2014':
        return this.buildDbError(`The change you are trying to make would violate the required relation ${error?.meta?.relation_name}.`)
      case 'P2023':
        return this.buildDbError(`Inconsistent column data: ${JSON.stringify(error.meta)}. Please check your input data and try again.`)
      case 'P2025':
        return this.buildDbError(
          `An operation failed because it depends on one or more records that were required but not found.: ${JSON.stringify(
            error.meta,
          )}. Please check your input data and try again.`,
        )
      default:
        return this.buildDbError(`Database Error: ${error.message} and error code: ${error.code}`)
    }
  }

  private static buildDbError(message: string): IResult<any> {
    return {
      error: true,
      code: EHttpCodes.BAD_REQUEST,
      reason: message,
      data: {},
      success: false,
    }
  }
}
