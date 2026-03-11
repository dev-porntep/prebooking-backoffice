import type { EventHandlerRequest, H3Event } from 'h3'
import { createLogModel } from '../utils/col-log.utils'
import type { LogModel } from '../utils/col-log.utils'

const MASKED_HEADERS = new Set(['authorization', 'cookie', 'set-cookie'])

const maskSensitiveHeaders = (
  headers: Record<string, string | string[] | undefined>,
): Record<string, string | string[] | undefined> => {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) =>
      MASKED_HEADERS.has(k.toLowerCase()) ? [k, '***'] : [k, v],
    ),
  )
}

const getHeader = (event: H3Event<EventHandlerRequest>, name: string): string => {
  const value = event.node.req.headers[name]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0) return value[0] ?? ''
  return ''
}

export default defineNitroPlugin((nitroApp) => {
  let logModel: LogModel | undefined

  nitroApp.hooks.hook('request', async (event) => {
    event.context['_startTime'] = Date.now()

    try {
      if (event.node.req.method === 'POST' || event.node.req.method === 'PUT' || event.node.req.method === 'PATCH') {
        event.context['requestBody'] = await readBody(event)
      }
    }
    catch {
      event.context['requestBody'] = undefined
    }

    const correlatorId = getHeader(event, 'x-correlator-id') || crypto.randomUUID()
    const journey = getHeader(event, 'x-journey')

    // Store txid on context so backendProxy can propagate it downstream
    event.context['txid'] = correlatorId

    logModel = createLogModel({ txid: correlatorId, service_type: journey || undefined })
  })

  nitroApp.hooks.hook('afterResponse', async (event, response) => {
    const req = event.node.req
    const res = event.node.res
    const { url, headers } = req
    const statusCode = res.statusCode

    if (!url?.startsWith('/api')) return

    const correlatorId = getHeader(event, 'x-correlator-id') || (event.context['txid'] as string ?? '')

    const logHeaders = maskSensitiveHeaders({
      'host':             headers['host'],
      'x-correlator-id': correlatorId,
      'x-journey':        headers['x-journey'],
      'accept':           headers['accept'],
      'content-type':     headers['content-type'],
      'accept-encoding':  headers['accept-encoding'],
      'accept-language':  headers['accept-language'],
      'origin':           headers['origin'],
      'referer':          headers['referer'],
      'authorization':    headers['authorization'],
      'cookie':           headers['cookie'],
    })

    const stepPayload = {
      headers:  logHeaders,
      body:     event.context['requestBody'],
    }

    if (statusCode >= 400) {
      logModel?.logStep(`Internal API: Request failed with status ${statusCode}`, {
        activity_name: 'internalAPI_afterResponse',
        endpoint:      url,
        method:        req.method,
        result_code:   statusCode.toString(),
        step_request:  stepPayload,
        step_response: response?.body,
      }, 'error')
      return
    }

    logModel?.logStep(`Internal API: Request completed with status ${statusCode}`, {
      activity_name: 'internalAPI_afterResponse',
      endpoint:      url,
      method:        req.method,
      result_code:   statusCode.toString(),
      step_request:  stepPayload,
      step_response: response?.body,
    })
  })
})
