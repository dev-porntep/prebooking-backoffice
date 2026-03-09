import type { H3Event } from 'h3'

const config = useRuntimeConfig()

export const backendFetch = async <T>(
  event: H3Event,
  path: string,
  options?: { method?: string; body?: unknown; query?: Record<string, unknown> },
): Promise<T> => {
  const token = event.context['auth']?.token

  return await ($fetch as any)(`${config.backendApiUrl}${path}`, {
    method: (options?.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    query: options?.query,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
