import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios'

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

const baseApiErrorResponse: AxiosError<any> = {
  name: '',
  message: '',
  response: {
    data: {},
    status: 500,
    config: {
      headers: {} as AxiosHeaders,
    },
    statusText: 'Internal Server Error',
    headers: {},
  },
  config: {
    headers: {} as AxiosHeaders,
  },
  isAxiosError: true,
  toJSON: () => ({}),
}

export function anApiErrorResponse<T>(
  overrides: Partial<AxiosError<T>['response']> = {}
): AxiosError<T> {
  return {
    ...baseApiErrorResponse,
    response: {
      ...baseApiErrorResponse.response,
      ...overrides,
    } as AxiosError<T>['response'],
  }
}
