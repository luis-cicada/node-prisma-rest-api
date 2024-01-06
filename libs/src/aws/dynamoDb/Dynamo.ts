import { DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Result } from '../../result'
import { EResultErrors, IResult } from '../../types'
import { IGetItemCommandOutput, IPutItemCommandOutput } from './types'

export class Dynamo {
  private client: DynamoDBClient

  constructor() {
    if (!process.env.AWS_ACCESS_KEY_ID) throw 'Missing AWS credentials'
    if (!process.env.AWS_SECRET_ACCESS_KEY) throw 'Missing AWS credentials'

    this.client = new DynamoDBClient({
      apiVersion: '2012-08-10',
      region: 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  /**
   * The function creates an item by sending a PutItemCommand to the client and returns a success
   * response or an error response.
   * @param {PutItemCommandInput} params - The `params` parameter is an object of type
   * `PutItemCommandInput`. It contains the necessary information to perform a `PutItem` operation on a
   * database table. This includes the table name, the item to be inserted, and any additional options
   * or conditions for the operation.
   * @returns a Promise that resolves to a Result object.
   */
  async createItem<T>(params: PutItemCommandInput): Promise<IResult<IPutItemCommandOutput<T>>> {
    try {
      const command = new PutItemCommand(params)

      const response = await this.client.send(command)

      return Result.success(response)
    } catch (error) {
      return Result.error(error, EResultErrors.DataBase)
    }
  }

  /**
   * The function retrieves an item using the GetItemCommand from a database and returns a success
   * response or an error response.
   * @param {GetItemCommandInput} params - The `params` parameter is an object that contains the input
   * parameters for the `GetItemCommand`. These parameters are used to specify which item to retrieve
   * from the database. The specific properties and their values depend on the implementation of the
   * `GetItemCommand` and the database being used.
   * @returns a Promise that resolves to a Result object.
   */
  async getItem<T>(params: GetItemCommandInput): Promise<IResult<IGetItemCommandOutput<T>>> {
    try {
      const commad = new GetItemCommand(params)

      const response = await this.client.send(commad)

      if (!response.Item) throw 'Item not found'

      return Result.success({ ...response, Item: unmarshall(response.Item) })
    } catch (error) {
      return Result.error(error, EResultErrors.DataBase)
    }
  }
}
