import { AbstractCommand } from './AbstractCommand'
import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar } from '../common/utils/EnvironmentUtills'
import { AuthenticateUserRequest } from '../types/AuthenticateUserRequest'
import { Token } from '../types/Token'

export class AuthenticateUserCommand extends AbstractCommand {
  public constructor (retryOptions?: RetryOptions) {
    super()
    this.retryOptions = retryOptions
  }

  public async authenticate (request: AuthenticateUserRequest): Promise<Token> {
    const wrappedRequest: WrappedRequest = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/token`,
      data: { username: request.username, password: request.password }
    }
    return await this.invokeRequest(wrappedRequest)
  }

  private async invokeRequest (wrappedRequest: WrappedRequest): Promise<Token> {
    return await this.apiCaller(wrappedRequest, this.retryOptions?.retryCount as number)
  }
}
