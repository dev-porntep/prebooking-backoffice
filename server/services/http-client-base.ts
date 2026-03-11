import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import axiosRetry from 'axios-retry'

import { createLogModel } from '../utils/col-log.utils'
import type { LogModel } from '../utils/col-log.utils'

declare module 'axios' {
  interface AxiosRequestConfig {
    startTime?: number
  }
}

export class HttpClientBase {
  protected instance: AxiosInstance
  private readonly maxRetries: number
  private readonly retriableStatusCodes: number[]

  private logModel: LogModel | undefined

  constructor(
    baseURL: string,
    timeout = 30000,
    maxRetries = 3,
    retriableStatusCodes = [408, 500, 502, 503, 504],
  ) {
    this.maxRetries = maxRetries
    this.retriableStatusCodes = retriableStatusCodes

    this.instance = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout,
    })

    this.initializeInterceptors()
  }

  private initializeInterceptors(): void {
    axiosRetry(this.instance, {
      retries: this.maxRetries,
      shouldResetTimeout: true,
      retryDelay: (retryCount: number) => 1000 * Math.pow(2, retryCount),
      retryCondition: (error: AxiosError) =>
        error.response
          ? this.retriableStatusCodes.includes(error.response.status)
          : true,
    })

    this.instance.interceptors.request.use(this.handleRequest, this.handleError)
    this.instance.interceptors.response.use(this.handleResponse, this.handleError)
  }

  protected handleRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.startTime = Date.now()
    this.logModel = createLogModel({
      txid:         config.headers?.['x-correlator-id'] as string | undefined,
      service_type: config.headers?.['x-journey'] as string | undefined,
    })
    return config
  }

  protected handleResponse = (response: AxiosResponse): AxiosResponse => {
    const config = response.config
    const headers = { ...(config?.headers ?? {}) } as Record<string, unknown>
    if (headers['authorization']) headers['authorization'] = '***'

    const endpoint = config?.baseURL && config?.url
      ? config.baseURL + config.url
      : undefined

    const request = endpoint
      ? JSON.stringify({
          headers,
          params: this.getRequestParams(config),
          data:   config.data,
        })
      : undefined

    this.logModel?.logStep('External API: HTTP client response', {
      activity_name: 'externalAPI_handleResponse',
      endpoint,
      method:        config.method?.toUpperCase(),
      step_request:  request,
      step_response: response.data,
      result_code:   response.status.toString(),
    })

    return response
  }

  protected handleError = (error: AxiosError<Record<string, unknown>>): Promise<never> => {
    this.logModel?.logStep('External API: HTTP client error', {
      activity_name: 'externalAPI_httpClientError',
      error,
    })

    if (error.response) {
      const { statusCode, statusMessage, data, errorCode } = error.response.data as Record<string, unknown>
      return Promise.reject(createError({
        statusCode:    (statusCode as number | undefined) ?? error.response.status,
        statusMessage: (statusMessage as string | undefined) ?? error.response.statusText,
        data,
        ...(errorCode ? { errorCode } : {}),
      }))
    }

    return Promise.reject(error)
  }

  private getRequestParams(config: AxiosRequestConfig): Record<string, unknown> | undefined {
    if (config.params instanceof URLSearchParams) {
      const params = Object.fromEntries(config.params.entries())
      return Object.keys(params).length > 0 ? params : undefined
    }

    if (config.params && Object.keys(config.params as Record<string, unknown>).length > 0) {
      return config.params as Record<string, unknown>
    }

    if (config.baseURL && config.url) {
      try {
        const fullUrl = new URL(config.url, config.baseURL)
        const params = Object.fromEntries(fullUrl.searchParams.entries())
        return Object.keys(params).length > 0 ? params : undefined
      }
      catch {
        return undefined
      }
    }

    return undefined
  }

  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.instance.get<T>(url, config)
  }

  public async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.instance.post<T>(url, data, config)
  }

  public async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.instance.put<T>(url, data, config)
  }

  public async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.instance.patch<T>(url, data, config)
  }

  public async delete<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.instance.delete<T>(url, { ...config, data })
  }
}
