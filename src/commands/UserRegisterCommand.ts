import { AbstractCommand } from './AbstractCommand'
import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { CommandFailedError } from '../errors/CommandFailedError'
import { UserRegisterRequest } from '../types/UserRegisterRequest'
import { User } from '../types/User'
import { WrappedResponse } from '../types/WrappedResponse'

export class UserRegisterCommand extends AbstractCommand<User> {
  public readonly retryOptions: RetryOptions

  public constructor (retryOptions?: RetryOptions) {
    super()
    this.retryOptions = (retryOptions != null) ? retryOptions : { sleepTime: 1, retryCount: 5 }
  }

  public async register (request: UserRegisterRequest): Promise<User> {
    const wrappedRequest: WrappedRequest = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/register`,
      data: { username: request.username, password: request.password, email: request.email },
      timeout: demandEnvVarAsNumber('ACCESS_AUTH_ENDPOINT_TIMEOUT')
    }
    const wrappedUser: WrappedResponse<User> = await this.invokeRequest(wrappedRequest)
    if (wrappedUser.data != null) {
      return wrappedUser.data
    }
    throw new CommandFailedError('Register user command failed unexpectedly')
  }

  private async invokeRequest (wrappedRequest: WrappedRequest): Promise<WrappedResponse<User>> {
    return await this.apiCaller(wrappedRequest, { ...this.retryOptions })
  }
}
