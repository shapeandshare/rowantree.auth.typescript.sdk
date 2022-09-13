import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { ExceededRetryCountError } from '../errors/ExceededRetryCountError'
import { RequestVerbType } from '../types/RequestVerbType'
import { UnkownRequestVerb } from '../errors/UnkownRequestVerb'

import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { RequestFailureError } from '../errors/RequestFailureError'
import FormData from 'form-data'
import { WrappedResponse } from '../types/WrappedResponse'

// https://github.com/axios/axios/issues/3612
export function isAxiosError (error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

export abstract class AbstractCommand<TDataType> {
  protected async apiCaller (wrappedRequest: WrappedRequest, retryOptions: RetryOptions): Promise<WrappedResponse<TDataType>> {
    if (retryOptions.retryCount < 1) {
      throw new ExceededRetryCountError(JSON.stringify({ message: 'Exceeded retries', request: this.redact(wrappedRequest), options: retryOptions }))
    }
    retryOptions.retryCount--

    let response: AxiosResponse
    const wrappedResponse: WrappedResponse<TDataType> = {}

    try {
      const config: AxiosRequestConfig = { timeout: wrappedRequest.timeout * 1000 }
      switch (wrappedRequest.verb) {
        case RequestVerbType.GET: {
          response = await axios.get(wrappedRequest.url, config)
          break
        }
        case RequestVerbType.POST: {
          response = await axios.post(wrappedRequest.url, wrappedRequest.data, config)
          break
        }
        case RequestVerbType.POST_FORM: {
          const form: FormData = new FormData()

          for (const key of Object.keys(wrappedRequest.data)) {
            const value: string = wrappedRequest.data[key]
            form.append(key, value)
          }

          response = await axios.post(wrappedRequest.url, form, config)
          break
        }
        case RequestVerbType.DELETE: {
          response = await axios.delete(wrappedRequest.url, config)
          break
        }
        default: {
          throw new UnkownRequestVerb(wrappedRequest.verb)
        }
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.status !== undefined) {
          if (wrappedRequest.statuses.allow.includes(error.response?.status)) {
            // Review success cases (Which might be exception inducing, 4xx, etc)
            // The payload could be anything, probable error details.
            console.log(error.response?.data)
            wrappedResponse.status = error.response?.status
            wrappedResponse.code = error.code
            return wrappedResponse
          } else if (wrappedRequest.statuses.retry.includes(error.response?.status)) {
            // Review failure cases
            console.log(`Received a retryable (${retryOptions.retryCount}) status code (${error.response?.status}), trying ...`)
            await this.delay(retryOptions.sleepTime)
            return await this.apiCaller(wrappedRequest, retryOptions)
          } else {
            console.log(`Not retrying after receiving status code (${error.response?.status}).`)
          }
        } else {
          console.log(`Failed to make request (${retryOptions.retryCount}) code (${String(error.code)}) (${JSON.stringify(error)}), trying ...`)
          await this.delay(retryOptions.sleepTime)
          return await this.apiCaller(wrappedRequest, retryOptions)
        }
      }
      throw new RequestFailureError(JSON.stringify({ request: this.redact(wrappedRequest), options: retryOptions, error: JSON.stringify(error) }))
    }

    if (wrappedRequest.statuses.allow.includes(response.status)) {
      wrappedResponse.data = response.data
      wrappedResponse.status = response.status
      return wrappedResponse
    }

    throw new RequestFailureError(JSON.stringify({ status_code: response.status, request: this.redact(wrappedRequest), options: retryOptions }))
  }

  private async delay (seconds: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }

  private redact (request: WrappedRequest): WrappedRequest {
    if (request.data.password !== undefined) {
      request.data.password = '[*** REDACTED ***]'
    }
    return request
  }
}
