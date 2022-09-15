import { ResponseStateType } from './ResponseStateType'

export interface WrappedResponse<TDataType> {
  status?: number
  code?: string
  data?: TDataType
  state: ResponseStateType
}
