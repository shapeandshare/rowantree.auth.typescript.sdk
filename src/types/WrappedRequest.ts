import { RequestVerbType } from './RequestVerbType'
import { RequestStatusCodes } from './RequestStatusCodes'

export interface WrappedRequest<TDataType> {
  verb: RequestVerbType
  statuses: RequestStatusCodes
  url: string
  data: TDataType
  timeout: number
}
