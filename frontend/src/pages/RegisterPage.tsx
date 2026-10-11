import { type FormEvent, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isApiRequestError } from '../api/apiError'
import { registerUser } from '../api/auth'
import arrowBack from '../assets/figma/arrow-back.svg'
import NumericKeypad from '../components/NumericKeypad'
import type { AuthFlowState } from '../types/authFlow'
import styles from './RegisterPage.module.css'

const DIAL_CODE = '+91'
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

function formatPhoneForDisplay(digits: string): string {
  if (digits.length <= 5) {
    return digits
  }
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function formatPhoneForOtp(digits: string): string {
  return `${DIAL_CODE} ${formatPhoneForDisplay(digits)}`
}

function validateIndianMobile(digits: string): string | null {
  if (digits.length === 0) {
    return 'Enter your 10-digit mobile number.'
  }
  if (digits.length < 10) {
    return 'Mobile number must be 10 digits.'
  }
  if (!INDIAN_MOBILE_PATTERN.test(digits)) {
    return 'Enter a valid Indian mobile number (starts with 6–9).'
  }
  return null
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const labelId = useId()
  const errorId = useId()
  const devDiagId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [digits, setDigits] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [devDiagnostics, setDevDiagnostics] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (value: string) => {
    setDigits(normalizeDigits(value))
    if (error) {
      setError(null)
      setDevDiagnostics(null)
    }
  }

  const appendDigit = (digit: string) => {
    handleChange(digits + digit)
    inputRef.current?.focus()
  }

  const backspaceDigit = () => {
    handleChange(digits.slice(0, -1))
    inputRef.current?.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateIndianMobile(digits)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setDevDiagnostics(null)
    try {
      await registerUser({ phone: digits, dialCode: DIAL_CODE })
      const state: AuthFlowState = {
        phone: digits,
        dialCode: DIAL_CODE,
        displayPhone: formatPhoneForOtp(digits),
      }
      navigate('/otp', { state })
    } catch (err) {
      if (isApiRequestError(err)) {
        setError(err.userMessage)
        setDevDiagnostics(import.meta.env.DEV ? err.devDiagnostics : null)
      } else {
        setError(err instanceof Error ? err.message : 'Could not send OTP. Please try again.')
        setDevDiagnostics(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.back}
        aria-label="Go back"
        onClick={() => navigate(-1)}
      >
        <img src={arrowBack} alt="" width={24} height={24} />
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>Sign Up to Fastor</h1>
        <p className={styles.subtitle}>
          Let us know your mobile number and we will send you an OTP for verification.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formUpper}>
          <div className={styles.field}>
            <label className={styles.visuallyHidden} htmlFor={labelId}>
              Mobile number
            </label>
            <div
              className={`${styles.phoneInput} ${error ? styles.phoneInputError : ''}`}
            >
              <span className={styles.prefix} aria-hidden="true">
                +91
              </span>
              <span className={styles.separator} aria-hidden="true">
                -
              </span>
              <input
                ref={inputRef}
                id={labelId}
                className={styles.input}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="00000 00000"
                value={formatPhoneForDisplay(digits)}
                onChange={(event) => handleChange(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error
                    ? devDiagnostics
                      ? `${errorId} ${devDiagId}`
                      : errorId
                    : undefined
                }
                disabled={isSubmitting}
              />
            </div>
            {error ? (
              <p className={styles.error} id={errorId} role="alert">
                {error}
              </p>
            ) : null}
            {devDiagnostics ? (
              <p className={styles.devDiagnostics} id={devDiagId}>
                {devDiagnostics}
              </p>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.submit} ${isSubmitting ? styles.submitLoading : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Get OTP'}
            </button>
            <p className={styles.legal}>
              By clicking, I accept the{' '}
              <a className={styles.legalLink} href="#terms">
                Terms &amp; Conditions
              </a>{' '}
              and{' '}
              <a className={styles.legalLink} href="#privacy">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className={styles.keypadDock}>
          <NumericKeypad
            onDigit={appendDigit}
            onBackspace={backspaceDigit}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  )
}
