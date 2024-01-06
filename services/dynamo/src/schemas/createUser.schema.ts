import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation'
import Joi from 'joi'
import { ICreateUserParams } from '../types/types'

export const bodyCreateUserSchema = Joi.object({
  first_name: Joi.string().required().max(100),
  middle_name: Joi.string().optional().max(100),
  last_name: Joi.string().required().max(100),
  email: Joi.string().required().max(100),
  phone_number: Joi.string().required().max(20),
})

export interface ICreateUserSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: ICreateUserParams
}
