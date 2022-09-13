import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { CommandFailedError } from '../errors/CommandFailedError'
import { UserRegisterRequest } from '../types/UserRegisterRequest'
import { User } from '../types/User'
import { WrappedResponse } from '../types/WrappedResponse'

export class UserRegisterCommand extends AbstractCommand<UserRegisterRequest, User> {
  public async register (request: UserRegisterRequest): Promise<User> {
    const wrappedRequest: WrappedRequest<UserRegisterRequest> = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/register`,
      data: { username: request.username, password: request.password, email: request.email },
      timeout: demandEnvVarAsNumber('ACCESS_AUTH_ENDPOINT_TIMEOUT')
    }
    const wrappedUser: WrappedResponse<User> = await this.invokeRequest(wrappedRequest)
    if (wrappedUser.data !== undefined) {
      return wrappedUser.data
    }
    throw new CommandFailedError(`Register user command failed unexpectedly: ${JSON.stringify(wrappedUser)}`)
  }
}
