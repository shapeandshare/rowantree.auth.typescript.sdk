import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { CommandFailedError } from '../errors/CommandFailedError'
import { UserRegisterRequest } from '../types/UserRegisterRequest'
import { User } from '../types/User'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserRegisterCommand extends AbstractCommand<UserRegisterRequest, User> {
  public async register (request: UserRegisterRequest): Promise<User> {
    const wrappedRequest: WrappedRequest<UserRegisterRequest> = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [] },
      url: `${demandEnvVar('ACCESS_AUTH_ENDPOINT')}/v1/auth/register`,
      data: request,
      timeout: demandEnvVarAsNumber('ACCESS_AUTH_ENDPOINT_TIMEOUT')
    }
    const wrappedResponse: WrappedResponse<User> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse.state === ResponseStateType.SUCCESS) && (wrappedResponse.data !== undefined)) {
      return wrappedResponse.data
    }
    throw new CommandFailedError(`Register user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
