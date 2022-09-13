import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { UnkownRequestVerb } from '../errors/UnkownRequestVerb'

import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import FormData from 'form-data'
import { WrappedResponse } from '../types/WrappedResponse'

// https://github.com/axios/axios/issues/3612
export function isAxiosError (error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

export abstract class AbstractCommand<TResponseDataType, TRequestDataType> {
  protected async apiCaller (wrappedRequest: WrappedRequest<TRequestDataType>, retryOptions: RetryOptions): Promise<WrappedResponse<TResponseDataType>> {
    let response: AxiosResponse
    const wrappedResponse: WrappedResponse<TResponseDataType> = {}

    if (retryOptions.retryCount < 1) {
      // We've exceeded our retries, we will return an empty wrapped response.  The command can decide how to handle this scenario.
      return wrappedResponse
    }
    retryOptions.retryCount--

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

          for (const key of Object.keys(wrappedRequest.data as Record<string, string>)) {
            const value: string = (wrappedRequest.data as Record<string, string>)[key]
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
            wrappedResponse.status = error.response?.status
            wrappedResponse.code = error.code
            return wrappedResponse
          }
        } else {
          console.log(`Failed to make request (${retryOptions.retryCount}) code (${String(error.code)}) (${JSON.stringify(error)}), trying ...`)
          await this.delay(retryOptions.sleepTime)
          return await this.apiCaller(wrappedRequest, retryOptions)
        }
      }
      // We encountered some kind of non-axios error..
      throw error
    }

    if (wrappedRequest.statuses.allow.includes(response.status)) {
      wrappedResponse.data = response.data
      wrappedResponse.status = response.status
      return wrappedResponse
    }

    // We succeeded with the axios request but did not get a success -or failure-- status code.
    return wrappedResponse
  }

  private async delay (seconds: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
}
