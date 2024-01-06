import { CORS_SETTINGS, EHttpCodes, IExpressRequest, Result, joiError } from '@portafolio/libs'
import express, { Response } from 'express'
import { createValidator } from 'express-joi-validation'
import serverless from 'serverless-http'
import { User } from './modules/Users'
import { ICreateUserSchema, bodyCreateUserSchema } from './schemas/createUser.schema'

// Instantiate Express App
const app = express()
const validator = createValidator({ statusCode: 422, passError: true })

app.use(express.json())

app.post('/dynamo', validator.body(bodyCreateUserSchema), async (req: IExpressRequest<ICreateUserSchema>, res: Response) => {
  res.set(CORS_SETTINGS)

  try {
    const users = new User()

    const response = await users.create(req.body)

    const status = response.success ? EHttpCodes.SUCCESS : response.code

    res.status(status).json(response)
  } catch (error) {
    res.status(500).json(Result.customError(error))
  }
})

app.use(joiError)

module.exports.handler = serverless(app)
