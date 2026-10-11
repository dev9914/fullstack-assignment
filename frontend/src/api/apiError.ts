import type { ApiFailureDetails } from './diagnostics'

export class ApiRequestError extends Error {
  readonly userMessage: string
  readonly devDiagnostics: string
  readonly details: ApiFailureDetails

  constructor(userMessage: string, devDiagnostics: string, details: ApiFailureDetails, cause?: unknown) {
    super(userMessage, cause !== undefined ? { cause } : undefined)
    this.name = 'ApiRequestError'
    this.userMessage = userMessage
    this.devDiagnostics = devDiagnostics
    this.details = details
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError
}
