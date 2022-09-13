import { AbstractCommand } from './AbstractCommand'
import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { UserAuthenticateRequest } from '../types/UserAuthenticateRequest'
import { Token } from '../types/Token'
import { CommandFailedError } from '../errors/CommandFailedError'
import { TokenLegacy } from '../types/TokenLegacy'
import { WrappedResponse } from '../types/WrappedResponse'

export class UserAuthenticateCommand extends AbstractCommand<TokenLegacy> {
  public readonly retryOptions: RetryOptions

  public constructor (retryOptions?: RetryOptions) {
    super()
    this.retryOptions = (retryOptions != null) ? retryOptions : { sleepTime: 1, retryCount: 5 }
  }

  public async authenticate (request: UserAuthenticateRequest): Promise<Token> {
    const wrappedRequest: WrappedRequest = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/token`,
      data: { username: request.username, password: request.password },
      timeout: demandEnvVarAsNumber('ACCESS_AUTH_ENDPOINT_TIMEOUT')
    }
    const wrappedTokenLegacy: WrappedResponse<TokenLegacy> = await this.invokeRequest(wrappedRequest)
    if ((wrappedTokenLegacy?.data) != null) {
      return {
        accessToken: wrappedTokenLegacy.data.access_token,
        tokenType: wrappedTokenLegacy.data.token_type
      }
    }
    throw new CommandFailedError('Authenticate user command failed unexpectedly')
  }

  private async invokeRequest (wrappedRequest: WrappedRequest): Promise<WrappedResponse<TokenLegacy>> {
    return await this.apiCaller(wrappedRequest, { ...this.retryOptions })
  }
}
