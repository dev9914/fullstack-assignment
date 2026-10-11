import axios, { type AxiosError } from 'axios'
import {
  analyzeAxiosFailure,
  formatDevDiagnostics,
  logApiFailureDev,
  userMessageForFailure,
} from './diagnostics'
import { getApiErrorMessage } from './parseApi'
import { ApiRequestError, isApiRequestError } from './apiError'
import { clearAuthToken, getAuthToken } from './session'

const DEFAULT_BASE_URL = 'https://staging.fastor.ai'

/**
 * In dev, default to same-origin requests so Vite can proxy `/v1` to staging (avoids CORS masking).
 * Override with VITE_API_BASE_URL when needed.
 */
function resolveApiBaseUrl(): string {
  const envValue = import.meta.env.VITE_API_BASE_URL
  if (typeof envValue === 'string' && envValue.trim() !== '') {
    return envValue.trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return ''
  }
  return DEFAULT_BASE_URL
}

export const apiBaseUrl = resolveApiBaseUrl()

export const restaurantCityId =
  import.meta.env.VITE_RESTAURANT_CITY_ID?.trim() || '118'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

/** URL-encoded form body; `+` in dial codes is encoded as `%2B`. */
export function toUrlEncoded(fields: Record<string, string>): string {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value)
  }
  return body.toString()
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiRequestError(error)) {
    return error.userMessage
  }
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError
    if (ax.response?.status === 401) {
      clearAuthToken()
      return 'Your session expired. Please sign in again.'
    }
    if (ax.response?.data !== undefined) {
      return getApiErrorMessage(ax.response.data, fallback)
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function throwApiRequestError(
  error: unknown,
  requestPath: string,
  method: string,
  actionFallback: string,
): never {
  const fallbackUrl = `${apiBaseUrl || '(same-origin)'}${requestPath}`
  const details = axios.isAxiosError(error)
    ? analyzeAxiosFailure(error, fallbackUrl, method)
    : { category: 'unknown' as const, method, requestUrl: fallbackUrl }

  const serverMessage = axios.isAxiosError(error) && error.response?.data !== undefined
    ? getApiErrorMessage(error.response.data, '')
    : ''

  const userMessage = userMessageForFailure(details, serverMessage || undefined, actionFallback)
  const devDiagnostics = formatDevDiagnostics(details)
  logApiFailureDev(details)
  throw new ApiRequestError(userMessage, devDiagnostics, details, error)
}
