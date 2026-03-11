import { randomUUID } from 'node:crypto'

import type { H3Event } from 'h3'

import { HttpClientBase } from '../services/http-client-base'

// Create a new client per request so each call gets its own log context (via interceptors)
const createClient = (): HttpClientBase => {
  const { backendApiUrl } = useRuntimeConfig()
  return new HttpClientBase(backendApiUrl as string)
}

export const backendFetch = async <T>(
  event: H3Event,
  path: string,
  options?: { method?: string; body?: unknown; query?: Record<string, unknown> },
): Promise<T> => {
  const client = createClient()
  const token  = event.context['auth']?.token as string | undefined
  const txid   = (event.context['txid'] as string | undefined) ?? randomUUID()
  const method = ((options?.method ?? 'GET') as string).toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'

  const axiosConfig = {
    params: options?.query,
    headers: {
      'Content-Type':    'application/json',
      'x-correlator-id': txid,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  const response = (method === 'get' || method === 'delete')
    ? await client[method]<T>(path, undefined, axiosConfig)
    : await client[method]<T>(path, options?.body, axiosConfig)

  return response.data
}
