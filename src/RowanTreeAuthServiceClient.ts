import { AuthenticateUserCommand } from './commands/AuthenticateUserCommand'
import { RetryOptions } from './types/RetryOptions'
import { Token } from './types/Token'
import { AuthenticateUserRequest } from './types/AuthenticateUserRequest'

export class RowanTreeAuthServiceClient {
  readonly #authUserCommand: AuthenticateUserCommand

  public constructor (retryOptions?: RetryOptions) {
    this.#authUserCommand = new AuthenticateUserCommand(retryOptions)
  }

  public async authUser (userName: string, password: string): Promise<Token> {
    const request: AuthenticateUserRequest = { password, username: userName }
    return await this.#authUserCommand.authenticate(request)
  }
}
