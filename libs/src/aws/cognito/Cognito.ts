import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
  ListUsersCommand,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandOutput,
  SignUpCommand,
  SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider'
import crypto from 'crypto'
import { IResult } from '../..'
import { Result } from '../../result'
import { ISignUpParams } from './types'

export class Cognito {
  private config: CognitoIdentityProviderClientConfig
  private secretHash: string
  private clientId: string
  private userPoolId: string
  private cognitoIdentity: CognitoIdentityProviderClient

  constructor() {
    if (
      !process.env.AWS_ACCESS_ID_KEY ||
      !process.env.AWS_ACCESS_SECRET_KEY ||
      !process.env.COGNITO_SECRET_KEY ||
      !process.env.COGNITO_CLIENT_ID ||
      !process.env.COGNITO_POOL_ID ||
      !process.env.REGION
    )
      throw 'Missing AWS credentials or Cognito config'

    this.config = {
      apiVersion: '2016-04-18',
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
      },
    }

    this.secretHash = process.env.COGNITO_SECRET_KEY
    this.clientId = process.env.COGNITO_CLIENT_ID
    this.userPoolId = process.env.COGNITO_POOL_ID
    this.cognitoIdentity = new CognitoIdentityProviderClient(this.config)
  }

  /**
   * It returns the number of users in the user pool with the same email or username as the user who is
   * trying to sign up
   * @param {string} username - The username of the user.
   * @param {string} email - The email address of the user.
   * @returns The number of users with the same email or username.
   */
  private async preSignUp(username: string, email: string) {
    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
      Filter: `email = "${email}" or username = "${username}"`,
    })

    try {
      const data = await this.cognitoIdentity.send(command)

      return Result.success(data.Users?.length ?? 0)
    } catch (error) {
      return Result.customError(error)
    }
  }

  /**
   * This function signs up a user with the given parameters and returns a promise with the result.
   * @param {ISignUpParams} params - ISignUpParams interface, which contains the following properties:
   * @returns This function returns a Promise that resolves to an object of type
   * `IResult<SignUpCommand>`. The `IResult` interface represents the result of an operation that can
   * either be successful or contain an error. The `SignUpCommand` object contains the parameters
   * required to sign up a user in a Cognito user pool.
   */
  public async signUp(params: ISignUpParams): Promise<IResult<SignUpCommandOutput>> {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: params.username,
      Password: params.password,
      UserAttributes: [
        { Name: 'email', Value: params.email },
        { Name: 'given_name', Value: params.first_name },
        { Name: 'middle_name', Value: params?.middle_name ?? '' },
        { Name: 'family_name', Value: params.last_name },
        { Name: 'name', Value: `${params.first_name} ${params.last_name}` },
        { Name: 'phone_number', Value: params.phone_number },
      ],
      SecretHash: this.generateSecretHash(params.username),
    })

    try {
      const userExists = await this.preSignUp(params.username, params.email)

      if (userExists.error) throw userExists.reason

      if (userExists.data > 0) throw 'User already exists'

      const data = await this.cognitoIdentity.send(command)

      return Result.success(data)
    } catch (error: any) {
      return Result.customError(error?.message ?? error)
    }
  }

  /**
   * The function `resendSignupCode` sends a confirmation code to a user's email address for account
   * verification.
   * @param {string} username - The `username` parameter is a string that represents the username of
   * the user for whom you want to resend the signup confirmation code.
   * @returns a Promise that resolves to an object of type
   * `IResult<ResendConfirmationCodeCommandOutput>`.
   */
  public async resendSignupCode(username: string): Promise<IResult<ResendConfirmationCodeCommandOutput>> {
    const command = new ResendConfirmationCodeCommand({
      ClientId: this.clientId,
      Username: username,
      SecretHash: this.generateSecretHash(username),
    })

    try {
      const data = await this.cognitoIdentity.send(command)
      return Result.success(data)
    } catch (error: any) {
      return Result.error(error.message ?? error)
    }
  }

  /**
   * This function confirms a user's sign up using their username and confirmation code.
   * @param {string} username - The username of the user who is trying to confirm their sign-up.
   * @param {string} code - The `code` parameter is a string representing the confirmation code that
   * was sent to the user's email or phone number during the sign-up process. This code is used to
   * confirm the user's identity and complete the sign-up process.
   * @returns This function returns a Promise that resolves to an object of type
   * `IResult<ConfirmSignUpCommand>`. The `IResult` interface likely contains information about the
   * success or failure of the operation, while the `ConfirmSignUpCommand` object contains the
   * parameters used to confirm a user's sign-up in Amazon Cognito.
   */
  public async confirmSignUp(username: string, code: string): Promise<IResult<ConfirmSignUpCommandOutput>> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      SecretHash: this.generateSecretHash(username),
      Username: username,
      ConfirmationCode: code,
    })

    try {
      const data = await this.cognitoIdentity.send(command)

      return Result.success(data)
    } catch (error: any) {
      return Result.customError(error.message ?? error)
    }
  }

  /**
   * This function authenticates a user by sending an InitiateAuthCommand to Cognito Identity with the
   * user's username, password, and secret hash.
   * @param {string} username - The username of the user trying to authenticate.
   * @param {string} password - The password parameter is a string that represents the user's password.
   * It is used in the authentication process to verify the user's identity.
   * @returns This function returns a Promise that resolves to an object of type
   * `IResult<InitiateAuthCommand>`. The `IResult` interface likely contains information about the
   * success or failure of the authentication attempt, while the `InitiateAuthCommand` object contains
   * the parameters used to initiate the authentication flow.
   */
  public async authenticaUser(username: string, password: string): Promise<IResult<InitiateAuthCommandOutput>> {
    const commnad = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: this.generateSecretHash(username),
      },
    })

    try {
      const data = await this.cognitoIdentity.send(commnad)

      return Result.success(data)
    } catch (error: any) {
      return Result.customError(error.message ?? error)
    }
  }

  /**
   * This function generates a secret hash using the username and client ID with the SHA256 algorithm
   * and returns it in base64 format.
   * @param {string} username - The username is a string parameter that is used as input to generate a
   * secret hash. It is concatenated with the client ID and then hashed using the SHA256 algorithm with
   * a secret key. The resulting hash is then encoded in base64 format and returned as a string. This
   * function is commonly used in authentication
   * @returns A string value representing the result of generating a secret hash using the username and
   * client ID, using the SHA256 algorithm and the provided secret hash as the key. The result is
   * encoded in base64 format.
   */
  private generateSecretHash(username: string): string {
    return crypto
      .createHmac('sha256', this.secretHash)
      .update(username + this.clientId)
      .digest('base64')
  }
}
