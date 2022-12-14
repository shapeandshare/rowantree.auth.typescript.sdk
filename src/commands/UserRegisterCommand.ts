import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { CommandFailedError } from '../errors/CommandFailedError'
import { UserRegisterRequest } from '../types/UserRegisterRequest'
import { User } from '../types/User'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserRegisterCommand extends AbstractCommand<UserRegisterRequest, User> {
  public async register (request: UserRegisterRequest): Promise<User> {
    const wrappedRequest: WrappedRequest<UserRegisterRequest> = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [0, 503] },
      url: `https://api.${this.options.tld}/auth/v1/register`,
      data: request,
      timeout: this.options.timeout
    }
    const wrappedResponse: WrappedResponse<User> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse.state === ResponseStateType.SUCCESS) && (wrappedResponse.data !== undefined)) {
      return wrappedResponse.data
    }
    throw new CommandFailedError(`Register user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
