import { AbstractCommand } from './AbstractCommand'
import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { CommandFailedError } from '../errors/CommandFailedError'
import { UserRegisterRequest } from '../types/UserRegisterRequest'
import { User } from '../types/User'

export class UserRegisterCommand extends AbstractCommand<User> {
  public readonly retryOptions: RetryOptions

  public constructor (retryOptions?: RetryOptions) {
    super()
    this.retryOptions = (retryOptions != null) ? retryOptions : { sleepTime: 1, retryCount: 5 }
  }

  public async register (request: UserRegisterRequest): Promise<User> {
    const wrappedRequest: WrappedRequest = {
      verb: RequestVerbType.POST,
      statuses: { allow: [200], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/register`,
      data: request,
      timeout: demandEnvVarAsNumber('ACCESS_AUTH_ENDPOINT_TIMEOUT')
    }
    const user: User | undefined = await this.invokeRequest(wrappedRequest)
    if (user === undefined) {
      throw new CommandFailedError('Register user command failed unexpectedly')
    }
    return user
  }

  private async invokeRequest (wrappedRequest: WrappedRequest): Promise<User | undefined> {
    return await this.apiCaller(wrappedRequest, { ...this.retryOptions })
  }
}
