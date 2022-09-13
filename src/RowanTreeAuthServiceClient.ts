import { UserAuthenticateCommand } from './commands/UserAuthenticateCommand'
import { RetryOptions } from './types/RetryOptions'
import { Token } from './types/Token'
import { UserAuthenticateRequest } from './types/UserAuthenticateRequest'
import { UserRegisterCommand } from './commands/UserRegisterCommand'
import { User } from './types/User'
import { UserRegisterRequest } from './types/UserRegisterRequest'

export class RowanTreeAuthServiceClient {
  readonly #userAuthCommand: UserAuthenticateCommand
  readonly #userRegisterCommand: UserRegisterCommand

  public constructor (retryOptions?: RetryOptions) {
    this.#userAuthCommand = new UserAuthenticateCommand(retryOptions)
    this.#userRegisterCommand = new UserRegisterCommand(retryOptions)
  }

  public async authUser (userName: string, password: string): Promise<Token> {
    const request: UserAuthenticateRequest = { password, username: userName }
    return await this.#userAuthCommand.authenticate(request)
  }

  public async registerUser (userName: string, password: string, email: string): Promise<User> {
    const request: UserRegisterRequest = { password, username: userName, email }
    return await this.#userRegisterCommand.register(request)
  }
}
