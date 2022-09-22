import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { UserAuthenticateRequest } from '../types/UserAuthenticateRequest'
import { Token } from '../types/Token'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserAuthenticateCommand extends AbstractCommand<UserAuthenticateRequest, Token> {
  public async authenticate (request: UserAuthenticateRequest): Promise<Token> {
    const wrappedRequest: WrappedRequest<UserAuthenticateRequest> = {
      verb: RequestVerbType.POST_FORM,
      statuses: { allow: [200], retry: [] },
      url: `https://api.${this.options.tld}/auth/v1/token`,
      data: request,
      timeout: this.options.timeout
    }
    const wrappedResponse: WrappedResponse<Token> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse.state === ResponseStateType.SUCCESS) && ((wrappedResponse?.data) !== undefined)) {
      return wrappedResponse.data
    }
    throw new CommandFailedError(`Authenticate user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
