import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import pino from 'pino'

import { resolveStepName } from '../helpers/step-name-map.helper'

export enum LogCategory {
  ORDER = 'order',
  STEP  = 'step',
}

type LogData = {
  txid:            string
  step_txid:       string
  log_cat?:        string
  service_type:    string
  start_date:      string
  end_date:        string
  result_indicator: string
  result_code:     string
  result_desc:     string
  endpoint?:       string
  method?:         string
  elapsed_time:    number
  step_name:       string
  step_request?:   string
  step_response?:  string
  request?:        string
  response?:       string
  search_key?:     string
  ref_id?:         string
  remark?:         string
}

type StepLogData = {
  txid:           string
  step_txid:      string
  log_cat?:       string
  service_type:   string
  start_date:     string
  end_date:       string
  result_indicator: string
  result_code:    string
  result_desc:    string
  endpoint:       string
  method?:        string
  elapsed_time:   number
  step_name:      string
  step_request:   string
  step_response:  string
  search_key?:    string
  remark?:        string
}

type CreateLogModelParams = {
  txid?:         string
  service_type?: string
  started_at?:   number
}

type LogInParams = {
  txid?:        string
  method?:      string
  endpoint?:    string
  request?:     unknown
  response?:    unknown
  result_code?: string
  search_key?:  string
  ref_id?:      string
  remark?:      string
}

type LogStepParams = {
  txid?:          string
  method?:        string
  endpoint?:      string
  step_request?:  unknown
  step_response?: unknown
  result_code?:   string
  activity_name:  string
  error?:         unknown
  search_key?:    string
  remark?:        string
}

type LogOutParams = {
  txid?:        string
  method?:      string
  endpoint?:    string
  request?:     unknown
  response?:    unknown
  result_code?: string
  search_key?:  string
  ref_id?:      string
  remark?:      string
}

type LogErrorParams = {
  txid?:        string
  method?:      string
  endpoint?:    string
  request?:     unknown
  response?:    unknown
  result_code?: string
  search_key?:  string
  error?:       unknown
  ref_id?:      string
  remark?:      string
}

// NOTE: pino.transport() spawns a worker thread for file rotation.
// This works correctly with Nitro's Node.js preset.
// If the project ever migrates to cloudflare/vercel-edge preset,
// worker threads are unavailable — replace with a synchronous pino destination.
const buildLogger = (cfg: {
  logPath: string
  logToFile: boolean
  logLevel: string
  logChannel: string
  logProduct: string
  serviceName: string
}): pino.Logger => {
  const targets: pino.TransportTargetOptions[] = []

  if (cfg.logToFile) {
    const logDir = path.dirname(path.resolve(cfg.logPath))
    let canWrite = true
    try {
      fs.mkdirSync(logDir, { recursive: true })
      fs.accessSync(logDir, fs.constants.W_OK)
    }
    catch {
      canWrite = false
    }

    if (canWrite) {
      targets.push({
        level: cfg.logLevel,
        target: 'pino-roll',
        options: {
          file: cfg.logPath,
          extension: '.log',
          frequency: 'hourly',
          dateFormat: 'yyyy-MM-dd-HH',
          mkdir: true,
        },
      })
    }
  }

  const baseConfig: pino.LoggerOptions = {
    level: cfg.logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin: () => ({ timestamp: new Date().toISOString() }),
    formatters: { level: (label: string) => ({ level: label.toUpperCase() }) },
    base: {
      channel: cfg.logChannel,
      product: cfg.logProduct,
      service: cfg.serviceName,
    },
  }

  return targets.length > 0
    ? pino(baseConfig, pino.transport({ targets }))
    : pino(baseConfig)
}

// Lazy singleton — useRuntimeConfig() must be called inside a function body in Nitro
let _logger: pino.Logger | null = null

const getLogger = (): pino.Logger => {
  if (_logger) return _logger
  const cfg = useRuntimeConfig().logging as {
    logPath: string
    logToFile: boolean
    logLevel: string
    logChannel: string
    logProduct: string
    serviceName: string
  }
  _logger = buildLogger(cfg)
  return _logger
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stringifyData = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data === null || data === undefined) return ''
  try {
    return JSON.stringify(data)
  }
  catch {
    return '[Circular or Non-serializable]'
  }
}

const safeError = (err: unknown): {
  name?:       string
  message?:    string
  code?:       string
  stack?:      string
  isAxiosError?: boolean
  status?:     number
  statusText?: string
  url?:        string
  method?:     string
  request?:    { headers?: unknown; params?: unknown; data?: unknown }
  response?:   { status?: number; statusText?: string; data?: unknown }
} => {
  if (!err || typeof err !== 'object') return {}

  const e = err as Record<string, unknown>

  const base = {
    name:    typeof e['name']    === 'string' ? e['name']    : undefined,
    message: typeof e['message'] === 'string' ? e['message'] : undefined,
    stack:   typeof e['stack']   === 'string' ? e['stack']   : undefined,
  }

  if (e['isAxiosError']) {
    const cfg = e['config'] as Record<string, unknown> | undefined
    const res = e['response'] as Record<string, unknown> | undefined
    let fullUrl: string | undefined
    if (typeof cfg?.['url'] === 'string' && cfg['baseURL']) {
      fullUrl = `${cfg['baseURL']}${cfg['url']}`
    }
    return {
      ...base,
      isAxiosError: true,
      code:       typeof e['code'] === 'string' ? e['code'] : undefined,
      status:     (res?.['status'] as number | undefined),
      statusText: (res?.['statusText'] as string | undefined),
      url:        fullUrl ?? (cfg?.['url'] as string | undefined),
      method:     typeof cfg?.['method'] === 'string' ? (cfg['method'] as string).toUpperCase() : undefined,
      request:    cfg ? { headers: cfg['headers'], params: cfg['params'], data: cfg['data'] } : undefined,
      response:   res ? { status: res['status'] as number, statusText: res['statusText'] as string, data: res['data'] } : undefined,
    }
  }

  return base
}

const resultDesc = (result_code: string): string => {
  const successCodes = ['0', '200', '201', '202', '204']
  return successCodes.includes(result_code) ? 'success' : 'failed'
}

const toCamelCase = (str: string): string =>
  str
    .trim()
    .replaceAll(/[-_.\s]+(.)?/g, (_, char: string | undefined) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, (char: string) => char.toLowerCase())
    .replaceAll(/[^\w]/g, '')

// ─── Public types ─────────────────────────────────────────────────────────────

export type LogModel = {
  logIn:    (msg: string, params: LogInParams,    log_cat?: LogCategory) => void
  logStep:  (msg: string, params: LogStepParams,  logLevel?: 'error' | 'info') => void
  logOut:   (msg: string, params: LogOutParams,   log_cat?: LogCategory) => void
  logError: (msg: string, params: LogErrorParams, log_cat?: LogCategory) => void
  clone:    () => LogModel
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export const createLogModel = ({
  txid:       defaultTxid,
  service_type = useRuntimeConfig().logging?.serviceName as string | undefined ?? 'prebooking-backoffice',
  started_at   = Date.now(),
}: CreateLogModelParams = {}): LogModel => {
  const cfg = useRuntimeConfig()
  const product = cfg.logging?.logProduct as string | undefined ?? 'backoffice'
  const _service_type = service_type ? `${product}_${service_type}` : product
  const start_date = new Date(started_at).toISOString()

  const _logStep = (msg: string, params: LogStepParams, logLevel?: 'error' | 'info'): void => {
    const logger = getLogger()
    const txid = params.txid ?? defaultTxid ?? randomUUID()
    const step_txid = `${txid}_${Date.now()}`
    const end_date = new Date().toISOString()
    const elapsed_time = started_at ? Date.now() - started_at : params.result_code ? 0 : 0

    let stepData: {
      result_code:   string
      step_name:     string
      endpoint:      string
      method?:       string
      message?:      string
      step_request:  unknown
      step_response: unknown
      remark?:       string
    }

    if (params.error) {
      const errInfo = safeError(params.error)
      const result_code = errInfo.status?.toString() ?? '500'
      stepData = {
        result_code,
        step_name:    resolveStepName(params.activity_name, errInfo.url, errInfo.method),
        endpoint:     errInfo.url ?? '',
        method:       errInfo.method,
        message:      errInfo.message ?? '',
        step_request: errInfo.request ?? params.step_request ?? {},
        step_response: errInfo.response ?? {},
        remark:       errInfo.stack,
      }
    }
    else {
      stepData = {
        result_code:   params.result_code ?? '0',
        step_name:     resolveStepName(params.activity_name, params.endpoint, params.method),
        endpoint:      params.endpoint ?? '',
        method:        params.method,
        step_request:  params.step_request ?? {},
        step_response: params.step_response ?? {},
        remark:        params.remark,
      }
    }

    const desc = resultDesc(stepData.result_code)
    const payload: StepLogData = {
      txid,
      step_txid,
      log_cat:          LogCategory.STEP,
      service_type:     _service_type,
      start_date,
      end_date,
      result_indicator: desc.toUpperCase(),
      result_code:      stepData.result_code,
      result_desc:      stepData.message ?? desc,
      elapsed_time,
      step_name:        stepData.step_name,
      endpoint:         stepData.endpoint,
      method:           stepData.method,
      step_request:     stringifyData(stepData.step_request),
      step_response:    stringifyData(stepData.step_response),
      search_key:       params.search_key,
      remark:           stepData.remark,
    }

    const level = logLevel ?? (params.error ? 'error' : 'info')
    logger[level](payload, `${LogCategory.STEP.toUpperCase()}: ${msg}`)
  }

  const logIn = (msg: string, params: LogInParams, log_cat = LogCategory.ORDER): void => {
    const logger = getLogger()
    const txid = params.txid ?? defaultTxid ?? randomUUID()
    const payload: LogData = {
      txid,
      step_txid:        txid,
      log_cat,
      service_type:     _service_type,
      start_date,
      end_date:         new Date().toISOString(),
      result_indicator: 'INPROGRESS',
      result_code:      params.result_code ?? '0',
      result_desc:      resultDesc(params.result_code ?? '0'),
      elapsed_time:     started_at ? Date.now() - started_at : 0,
      step_name:        txid,
      endpoint:         params.endpoint,
      method:           params.method,
      request:          stringifyData(params.request ?? {}),
      response:         stringifyData(params.response ?? {}),
      search_key:       params.search_key,
      ref_id:           params.ref_id,
      remark:           params.remark,
    }
    logger.info(payload, `${log_cat.toUpperCase()}: ${msg}`)
    _logStep(msg, {
      txid,
      endpoint:     params.endpoint,
      method:       params.method,
      step_request: params.request,
      step_response: params.response,
      result_code:  params.result_code,
      activity_name: toCamelCase(msg),
      search_key:   params.search_key,
      remark:       params.remark,
    })
  }

  const logOut = (msg: string, params: LogOutParams, log_cat = LogCategory.ORDER): void => {
    const logger = getLogger()
    const txid = defaultTxid ?? randomUUID()
    const payload: LogData = {
      txid,
      step_txid:        txid,
      log_cat,
      service_type:     _service_type,
      start_date,
      end_date:         new Date().toISOString(),
      result_indicator: 'COMPLETED',
      result_code:      params.result_code ?? '0',
      result_desc:      resultDesc(params.result_code ?? '0'),
      elapsed_time:     started_at ? Date.now() - started_at : 0,
      step_name:        txid,
      endpoint:         params.endpoint,
      method:           params.method,
      request:          stringifyData(params.request ?? {}),
      response:         stringifyData(params.response ?? {}),
      search_key:       params.search_key,
      ref_id:           params.ref_id,
      remark:           params.remark,
    }
    _logStep(msg, {
      txid,
      endpoint:     params.endpoint,
      method:       params.method,
      step_request: params.request,
      step_response: params.response,
      result_code:  params.result_code,
      activity_name: toCamelCase(msg),
      search_key:   params.search_key,
      remark:       params.remark,
    })
    logger.info(payload, `${log_cat.toUpperCase()}: ${msg}`)
  }

  const logError = (msg: string, params: LogErrorParams, log_cat = LogCategory.ORDER): void => {
    const logger = getLogger()
    const txid = defaultTxid ?? randomUUID()
    const end_date = new Date().toISOString()
    const elapsed_time = started_at ? Date.now() - started_at : 0

    let request    = stringifyData(params.request ?? {})
    let result_code = params.result_code ?? '500'
    let endpoint   = params.endpoint ?? ''
    let response   = stringifyData(params.response ?? {})

    if (params.error) {
      const errInfo = safeError(params.error)
      result_code = errInfo.status?.toString() ?? '500'
      endpoint    = errInfo.url ?? endpoint
      request     = stringifyData(errInfo.request ?? {})
      response    = stringifyData(errInfo.response ?? {})
      _logStep(msg, { txid, error: params.error, activity_name: toCamelCase(msg), search_key: params.search_key, remark: params.remark })
    }
    else {
      _logStep(msg, {
        txid,
        endpoint:      params.endpoint,
        method:        params.method,
        step_request:  params.request,
        step_response: params.response,
        result_code,
        activity_name: toCamelCase(msg),
        search_key:    params.search_key,
        remark:        params.remark,
      })
    }

    const payload: LogData = {
      txid,
      step_txid:        txid,
      log_cat,
      service_type:     _service_type,
      start_date,
      end_date,
      result_indicator: 'FAILED',
      result_code,
      result_desc:      resultDesc(result_code),
      elapsed_time,
      step_name:        txid,
      endpoint,
      method:           params.method,
      request,
      response,
      search_key:       params.search_key,
      ref_id:           params.ref_id,
      remark:           params.remark,
    }
    logger.error(payload, `${log_cat.toUpperCase()}: ${msg}`)
  }

  const clone = (): LogModel => createLogModel({ txid: defaultTxid, service_type, started_at: Date.now() })

  return { logIn, logStep: _logStep, logOut, logError, clone }
}
