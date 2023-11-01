/*  Result
========================================= */
export interface IResult<T> {
  error?: boolean | IErrorResponse
  code: number
  reason: string
  data: T
  success: boolean
  pagination?: any
}

export interface IResultCustomMetadata {
  request?: IRequestMetadata
  error?: IResultErrorMetadata
  stack?: object
}

export interface IRequestMetadata {
  body?: any
  queryParams?: any
  params?: any
}

export interface IResultErrorMetadata extends Partial<IErrorResponse> {
  stack?: object
  undetected?: object
}

export interface IErrorResponse {
  code?: string
  message: string
  detail?: string
  help?: string
  custom_internal_error?: boolean
  internalMessage?: string
  overrideCode?: EHttpErrors
  overrideStatusResponse?: boolean
  metadata?: any
}

export enum EHttpErrors {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SUCCESS = 200,
}

export enum EResultErrors {
  DataBase = 'database',
  Message = 'message',
  Result = 'result',
  None = 'none',
}
