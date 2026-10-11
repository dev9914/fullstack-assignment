import axios, { type AxiosError } from 'axios'

export type ApiFailureCategory =
  | 'http'
  | 'network'
  | 'cors_suspected'
  | 'timeout'
  | 'unknown'

export type ApiFailureDetails = {
  category: ApiFailureCategory
  method: string
  requestUrl: string
  status?: number
  statusText?: string
  responsePreview?: string
}

const PREVIEW_MAX = 280

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function resolveRequestUrl(error: AxiosError): string {
  const base = error.config?.baseURL ?? ''
  const path = error.config?.url ?? ''
  if (path.startsWith('http')) {
    return path
  }
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function previewResponseBody(data: unknown): string | undefined {
  if (data === undefined || data === null) {
    return undefined
  }
  if (typeof data === 'string') {
    const trimmed = data.replace(/\s+/g, ' ').trim()
    if (!trimmed) {
      return undefined
    }
    return trimmed.length > PREVIEW_MAX ? `${trimmed.slice(0, PREVIEW_MAX)}…` : trimmed
  }
  try {
    const json = JSON.stringify(data)
    return json.length > PREVIEW_MAX ? `${json.slice(0, PREVIEW_MAX)}…` : json
  } catch {
    return String(data)
  }
}

export function analyzeAxiosFailure(
  error: unknown,
  fallbackUrl: string,
  method: string,
): ApiFailureDetails {
  if (!axios.isAxiosError(error)) {
    return {
      category: 'unknown',
      method,
      requestUrl: fallbackUrl,
    }
  }

  const ax = error as AxiosError
  const requestUrl = resolveRequestUrl(ax) || fallbackUrl

  if (ax.response) {
    return {
      category: 'http',
      method,
      requestUrl,
      status: ax.response.status,
      statusText: ax.response.statusText,
      responsePreview: previewResponseBody(ax.response.data),
    }
  }

  if (ax.code === 'ECONNABORTED') {
    return {
      category: 'timeout',
      method,
      requestUrl,
    }
  }

  if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
    return {
      category: isBrowser() ? 'cors_suspected' : 'network',
      method,
      requestUrl,
    }
  }

  return {
    category: 'network',
    method,
    requestUrl,
  }
}

export function userMessageForFailure(
  details: ApiFailureDetails,
  serverMessage?: string,
  actionFallback = 'Request failed.',
): string {
  if (serverMessage?.trim()) {
    return serverMessage.trim()
  }

  switch (details.category) {
    case 'http':
      if (details.status === 404) {
        return 'The server returned 404 Not Found for this API path. Confirm the staging endpoint is available.'
      }
      if (details.status === 401) {
        return 'Authentication failed. Please sign in again.'
      }
      if (details.status === 502 || details.status === 503 || details.status === 504) {
        return `Upstream/gateway error (${details.status}). The API proxy or staging host may be unreachable.`
      }
      if (details.status && details.status >= 500) {
        return `Server error (${details.status}). Please try again later.`
      }
      if (details.status) {
        return `Request failed with status ${details.status}${details.statusText ? ` (${details.statusText})` : ''}.`
      }
      return actionFallback
    case 'timeout':
      return 'The request timed out. Check your connection and try again.'
    case 'cors_suspected':
      return 'The browser blocked this request (network/CORS). Use the Vite dev server with the configured `/v1` proxy, or the API must allow your origin.'
    case 'network':
      return 'Could not reach the server. Check your network connection.'
    default:
      return actionFallback
  }
}

export function formatDevDiagnostics(details: ApiFailureDetails): string {
  const parts = [
    `[dev] category=${details.category}`,
    `method=${details.method}`,
    `url=${details.requestUrl}`,
  ]
  if (details.status !== undefined) {
    parts.push(`status=${details.status}`)
  }
  if (details.statusText) {
    parts.push(`statusText=${details.statusText}`)
  }
  if (details.responsePreview) {
    parts.push(`body=${details.responsePreview}`)
  }
  if (details.category === 'cors_suspected') {
    parts.push(
      'note=No response received in browser; often CORS or offline. Dev proxy may expose real HTTP status.',
    )
  }
  return parts.join(' · ')
}

export function logApiFailureDev(details: ApiFailureDetails): void {
  if (!import.meta.env.DEV) {
    return
  }
  console.warn('[Fastor API]', formatDevDiagnostics(details))
}
