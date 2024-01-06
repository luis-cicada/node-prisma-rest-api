import { Dynamo, EResultErrors, IResult, Result } from '@portafolio/libs'
import uuid4 from 'uuid4'
import { ICreateUserParams, Users } from '../types/types'

export class User {
  private dynamo: Dynamo

  constructor() {
    this.dynamo = new Dynamo()
  }

  /**
   * The above function creates a new user in a database using the provided data and returns a result
   * indicating success or failure.
   * @param {ICreateUserParams} data - The `data` parameter is an object that contains the following
   * properties: `first_name`, `middle_name`, `last_name`, `email`, and `phone_number`.
   * @returns The function `create` returns a Promise that resolves to an object of type
   * `IResult<Users>`.
   */
  async create(data: ICreateUserParams): Promise<IResult<any>> {
    try {
      const { first_name, middle_name, last_name, email, phone_number } = data

      // Create a new user in the database
      const result = await this.dynamo.createItem({
        TableName: 'users',
        Item: {
          key: { S: uuid4() },
          first_name: { S: first_name },
          ...(middle_name && { middle_name: { S: middle_name } }),
          last_name: { S: last_name },
          email: { S: email },
          phone_number: { S: phone_number },
        },
        Expected: {
          email: { Exists: false },
        },
      })

      if (result?.error) throw result.reason

      // Return the new user
      const userResult = await this.dynamo.getItem<Users>({
        TableName: 'users',
        Key: {
          email: { S: email },
        },
        ConsistentRead: true,
        AttributesToGet: ['key', 'first_name', 'middle_name', 'last_name', 'email', 'phone_number'],
      })

      if (userResult?.error && !userResult?.data.Item) throw userResult.reason

      const user = userResult.data.Item

      return Result.success(user)
    } catch (error) {
      return Result.error(error, EResultErrors.DataBase)
    }
  }
}
