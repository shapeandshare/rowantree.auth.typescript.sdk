
export interface WrappedResponse<TDataType> {
  status?: number
  code?: string
  data?: TDataType
}
