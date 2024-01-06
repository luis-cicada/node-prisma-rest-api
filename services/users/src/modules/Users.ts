import { DbClient, EResultErrors, IResult, Result, Users, dbClient } from '@portafolio/libs'
import { ICreateUserParams } from '../types/types'

export class User {
  db: DbClient

  constructor() {
    this.db = dbClient
  }

  /**
   * The above function creates a new user in a database using the provided data and returns a result
   * indicating success or failure.
   * @param {ICreateUserParams} data - The `data` parameter is an object that contains the following
   * properties: `first_name`, `middle_name`, `last_name`, `email`, and `phone_number`.
   * @returns The function `create` returns a Promise that resolves to an object of type
   * `IResult<Users>`.
   */
  async create(data: ICreateUserParams): Promise<IResult<Users>> {
    try {
      const { first_name, middle_name, last_name, email, phone_number } = data

      const user = await this.db.prisma.users.create({
        data: {
          first_name,
          ...(middle_name && { middle_name }),
          last_name,
          email,
          phone_number,
          status: 'active',
        },
      })

      if (!user) throw 'Error creating user'

      return Result.success(user)
    } catch (error) {
      return Result.error(error, EResultErrors.DataBase)
    }
  }

  /**
   * The function retrieves a user from a database using the provided ID and returns a result
   * indicating success or failure.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * user you want to retrieve from the database.
   * @returns The `get` function returns a Promise that resolves to an `IResult` object. The `IResult`
   * object represents the result of the operation and contains either the user object if the operation
   * was successful, or an error object if there was an error.
   */
  async get(id: string): Promise<IResult<Users>> {
    try {
      const user = await this.db.prisma.users.findUnique({
        where: { id },
      })

      if (!user) throw 'Error getting user'

      return Result.success(user)
    } catch (error) {
      return Result.error(error, EResultErrors.DataBase)
    }
  }
}
