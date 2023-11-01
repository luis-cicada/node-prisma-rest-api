import { CORS_SETTINGS, Result } from '@portafolio/libs'
import express, { Request, Response } from 'express'
import serverless from 'serverless-http'
import { Users } from './modules/Users'

// Instantiate Express App
const app = express()

app.use(express.json())

app.post('/users', async (req: Request, res: Response) => {
  res.set(CORS_SETTINGS)

  try {
    const users = new Users()

    const response = await users.createUser(req.body)

    const status = response.success ? 200 : response.code

    res.status(status).json(response)
  } catch (error) {
    res.status(500).json(Result.customError(error))
  }
})

module.exports.handler = serverless(app)
