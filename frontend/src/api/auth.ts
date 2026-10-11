import { apiClient, throwApiRequestError, toUrlEncoded } from './client'
import { extractAuthToken } from './parseApi'
import { setAuthToken } from './session'

export type RegisterParams = {
  phone: string
  dialCode: string
}

export type LoginParams = {
  phone: string
  otp: string
  dialCode: string
}

const REGISTER_PATH = '/v1/pwa/user/register'
const LOGIN_PATH = '/v1/pwa/user/login'

const formHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
} as const

export async function registerUser(params: RegisterParams): Promise<void> {
  const body = toUrlEncoded({
    phone: params.phone,
    dial_code: params.dialCode,
  })

  try {
    await apiClient.post(REGISTER_PATH, body, { headers: formHeaders })
  } catch (error) {
    throwApiRequestError(error, REGISTER_PATH, 'POST', 'Could not send OTP. Please try again.')
  }
}

export async function loginWithOtp(params: LoginParams): Promise<void> {
  const body = toUrlEncoded({
    phone: params.phone,
    otp: params.otp,
    dial_code: params.dialCode,
  })

  let responseData: unknown
  try {
    const response = await apiClient.post(LOGIN_PATH, body, { headers: formHeaders })
    responseData = response.data
  } catch (error) {
    throwApiRequestError(error, LOGIN_PATH, 'POST', 'Invalid code or login failed. Please try again.')
  }

  const token = extractAuthToken(responseData)
  if (!token) {
    throw new Error('Login succeeded but no token was returned. Please try again.')
  }
  setAuthToken(token)
}
