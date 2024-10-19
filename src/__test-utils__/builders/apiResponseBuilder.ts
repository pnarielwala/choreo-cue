import { AxiosHeaders, AxiosResponse } from 'axios'

const baseApiResponse: AxiosResponse<any> = {
  data: {},
  status: 200,
  config: {
    headers: {} as AxiosHeaders,
  },
  statusText: '',
  headers: {},
}

export function anApiResponse<T>(
  overrides: Partial<AxiosResponse<T>> = {}
): AxiosResponse<T> {
  return {
    ...baseApiResponse,
    ...overrides,
  }
}
