import { EHttpErrors, IErrorResponse } from '../types'

export class GenericErrors {
  static INTERNAL_SERVER: IErrorResponse = { code: 'E1_500', message: 'Unhandled Error', detail: 'Please contact support' }

  static CUSTOM_INTERNAL_ERROR = (message: string): IErrorResponse => {
    return {
      code: 'E1_500',
      message: 'Unhandled Error',
      detail: 'Please contact support',
      custom_internal_error: true,
      overrideCode: EHttpErrors.INTERNAL_SERVER_ERROR,
      internalMessage: message,
    }
  }

  static LAMBDA_PERMISSION: IErrorResponse = {
    code: 'E1_500',
    message: 'The lambda does not have the permission configured which is necessary for it to be executed.',
    detail: `This happens when a lambda doesn't have the right permission in its env`,
  }

  static FORBIDDEN_DUE_TO_SCOPES: IErrorResponse = {
    code: 'E1_403',
    overrideStatusResponse: true,
    overrideCode: EHttpErrors.FORBIDDEN,
    message: 'The user does not have the necessary scope to perform this action',
    detail: `This happens when you're trying to make a CRUD operation in resource that are not part of your company or created by you`,
  }

  static FORBIDDEN_DUE_TO_PERMISSIONS: IErrorResponse = {
    code: 'E1_403',
    overrideStatusResponse: true,
    overrideCode: EHttpErrors.FORBIDDEN,
    message: 'The user does not have the necessary permission to perform this action',
    detail: `This happens when you're trying to make a CRUD operation that you don't have permission`,
  }

  static INVALID_RESOURCE_ID: IErrorResponse = {
    code: 'E1_400',
    message: 'The resource id provided in path params is invalid',
    detail: `This happens when you're trying to send a E1 resource id in path params and it is invalid, should have a length of 24 characters`,
  }

  static MISSING_PAGINATION_MIDDLEWARE: IErrorResponse = {
    code: 'E1_500',
    message: 'Error while retrieving data',
    detail: 'This endpoint requires the pagination middleware',
    overrideStatusResponse: true,
    overrideCode: EHttpErrors.INTERNAL_SERVER_ERROR,
  }

  static MISSING_ACTIVE_USER_MIDDLEWARE: IErrorResponse = {
    code: 'E1_500',
    message: 'Error while retrieving data',
    detail: 'This endpoint requires the active user middleware',
    overrideStatusResponse: true,
    overrideCode: EHttpErrors.INTERNAL_SERVER_ERROR,
  }

  static UNAUTHORIZED_RESOURCE_SCOPE: IErrorResponse = {
    code: 'E1_403',
    message: 'The user does not have the necessary scope to perform this action',
    detail: `This happens when you're trying to make a CRUD operation in resource that are not part of your agency or created by you`,
  }
}
