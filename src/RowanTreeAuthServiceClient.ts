import { UserAuthenticateCommand } from './commands/UserAuthenticateCommand'
import { CommandOptions } from './types/CommandOptions'
import { Token } from './types/Token'
import { UserAuthenticateRequest } from './types/UserAuthenticateRequest'
import { UserRegisterCommand } from './commands/UserRegisterCommand'
import { User } from './types/User'
import { UserRegisterRequest } from './types/UserRegisterRequest'
import { TokenClaims } from './types/TokenClaims'
import jwtDecode from 'jwt-decode'

export class RowanTreeAuthServiceClient {
  readonly #userAuthCommand: UserAuthenticateCommand
  readonly #userRegisterCommand: UserRegisterCommand

  public constructor (options?: CommandOptions) {
    this.#userAuthCommand = new UserAuthenticateCommand(options)
    this.#userRegisterCommand = new UserRegisterCommand(options)
  }

  public async authUser (userName: string, password: string): Promise<Token> {
    const request: UserAuthenticateRequest = { password, username: userName }
    return await this.#userAuthCommand.authenticate(request)
  }

  public async registerUser (userName: string, password: string, email: string): Promise<User> {
    const request: UserRegisterRequest = { password, username: userName, email }
    return await this.#userRegisterCommand.register(request)
  }

  public decodeJwt (jwt: string): TokenClaims {
    return jwtDecode<TokenClaims>(jwt)
  }
}
