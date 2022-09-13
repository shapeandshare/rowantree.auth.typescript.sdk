import { RetryOptions } from '../types/RetryOptions'
import { Token } from '../types/Token'
import { WrappedRequest } from '../types/WrappedRequest'
import { ExceededRetryCountError } from '../errors/ExceededRetryCountError'
import { RequestVerbType } from '../types/RequestVerbType'
import { UnkownRequestVerb } from '../errors/UnkownRequestVerb'

// import axios,{ AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosResponse } from 'axios'
import { RequestFailureError } from '../errors/RequestFailureError'
// const FormData = require('form-data')
import FormData from 'form-data'

export abstract class AbstractCommand<TRequest, TResponse> {
  public retryOptions?: RetryOptions
  public abstract authenticate (request: TRequest): Promise<TResponse>

  protected async apiCaller (wrappedRequest: WrappedRequest, retryCount: number): Promise<Token> {
    if (retryCount < 1) {
      throw new ExceededRetryCountError()
    }
    retryCount--

    let response: AxiosResponse

    switch (wrappedRequest.verb) {
      case RequestVerbType.GET: {
        response = await axios.get(wrappedRequest.url)
        break
      }
      case RequestVerbType.POST: {
        // const config: AxiosRequestConfig<any> = {};
        // response = await axios.post(wrappedRequest.url, wrappedRequest.data, config);
        response = await axios.post(wrappedRequest.url, wrappedRequest.data)

        if (wrappedRequest.statuses.allow.includes(response.status)) {
          return response.data
        }

        break
      }
      case RequestVerbType.POST_FORM: {
        const form: FormData = new FormData()

        for (const key of Object.keys(wrappedRequest.data)) {
          const value: string = wrappedRequest.data[key]
          form.append(key, value)
        }

        response = await axios.post(wrappedRequest.url, form)
        break
      }
      case RequestVerbType.DELETE: {
        response = await axios.delete(wrappedRequest.url)
        break
      }
      default: {
        throw new UnkownRequestVerb(wrappedRequest.verb)
      }
    }

    if (wrappedRequest.statuses.allow.includes(response.status)) {
      return response.data
    }

    if (wrappedRequest.statuses.retry.includes(response.status)) {
      return await this.apiCaller(wrappedRequest, retryCount)
    }

    throw new RequestFailureError(JSON.stringify({ status_code: response.status, request: wrappedRequest, retryCount }))
  }
}
