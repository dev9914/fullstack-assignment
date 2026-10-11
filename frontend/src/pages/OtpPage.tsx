import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginWithOtp, registerUser } from '../api/auth'
import arrowBack from '../assets/figma/arrow-back.svg'
import otpGroupDash from '../assets/figma/otp-group-dash.svg'
import NumericKeypad from '../components/NumericKeypad'
import authStyles from '../styles/authScreen.module.css'
import type { AuthFlowState } from '../types/authFlow'
import styles from './OtpPage.module.css'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `(${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`
}

function validateOtp(code: string): string | null {
  if (code.length === 0) {
    return 'Enter the 6-digit code.'
  }
  if (!/^\d{6}$/.test(code)) {
    return 'Enter a valid 6-digit code.'
  }
  return null
}

function isAuthFlowState(value: unknown): value is AuthFlowState {
  if (!value || typeof value !== 'object') {
    return false
  }
  const state = value as AuthFlowState
  return (
    typeof state.phone === 'string' &&
    typeof state.dialCode === 'string' &&
    typeof state.displayPhone === 'string'
  )
}

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const flow = isAuthFlowState(location.state) ? location.state : null
  const formId = useId()
  const errorId = useId()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (!flow) {
      navigate('/', { replace: true })
    }
  }, [flow, navigate])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const otpValue = digits.join('')
  const isComplete = otpValue.length === OTP_LENGTH && digits.every((d) => d !== '')

  const updateDigits = useCallback(
    (next: string[]) => {
      setDigits(next)
      if (error) {
        setError(null)
      }
    },
    [error],
  )

  const focusInput = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index))
    setFocusedIndex(clamped)
    inputRefs.current[clamped]?.focus()
  }

  const applyDigitsFromString = (raw: string, startIndex = 0) => {
    const chars = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex)
    if (chars.length === 0) {
      return
    }
    const next = [...digits]
    for (let i = 0; i < chars.length; i += 1) {
      next[startIndex + i] = chars[i] ?? ''
    }
    updateDigits(next)
    const nextFocus = Math.min(startIndex + chars.length, OTP_LENGTH - 1)
    focusInput(nextFocus)
  }

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    updateDigits(next)
    if (char && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        updateDigits(next)
      } else if (index > 0) {
        focusInput(index - 1)
        const next = [...digits]
        next[index - 1] = ''
        updateDigits(next)
      }
      event.preventDefault()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
      event.preventDefault()
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
      event.preventDefault()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault()
    applyDigitsFromString(event.clipboardData.getData('text'), index)
  }

  const handleKeypadDigit = (digit: string) => {
    const emptyIndex = digits.findIndex((d) => !d)
    const index = emptyIndex === -1 ? OTP_LENGTH - 1 : emptyIndex
    handleChange(index, digit)
    focusInput(Math.min(index + 1, OTP_LENGTH - 1))
  }

  const handleKeypadBackspace = () => {
    let index = focusedIndex
    if (!digits[index] && index > 0) {
      index -= 1
    }
    const next = [...digits]
    next[index] = ''
    updateDigits(next)
    focusInput(index)
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || !flow || isResending) {
      return
    }
    setIsResending(true)
    setError(null)
    try {
      await registerUser({ phone: flow.phone, dialCode: flow.dialCode })
      setSecondsLeft(RESEND_SECONDS)
      updateDigits(Array(OTP_LENGTH).fill(''))
      focusInput(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.')
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!flow) {
      return
    }
    const validationError = validateOtp(otpValue)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await loginWithOtp({
        phone: flow.phone,
        otp: otpValue,
        dialCode: flow.dialCode,
      })
      navigate('/restaurants')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code or login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!flow) {
    return null
  }

  return (
    <div className={authStyles.page}>
      <button
        type="button"
        className={authStyles.back}
        aria-label="Go back"
        onClick={() => navigate('/')}
      >
        <img src={arrowBack} alt="" width={24} height={24} />
      </button>

      <header className={authStyles.header}>
        <h1 className={authStyles.title}>6-digit code</h1>
        <p className={authStyles.subtitle}>Please enter the code we&apos;ve sent to</p>
        <p className={authStyles.phone}>{flow.displayPhone}</p>
      </header>

      <form
        id={formId}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.formUpper}>
          <div className={styles.fieldError}>
            <div className={styles.otpSection}>
              <p className={authStyles.visuallyHidden} id={`${formId}-otp-label`}>
                Six-digit verification code
              </p>
              <div
                className={styles.otpRow}
                role="group"
                aria-labelledby={`${formId}-otp-label`}
              >
                <div className={styles.otpGroup}>
                  {digits.slice(0, 3).map((digit, index) => (
                    <div
                      key={index}
                      className={`${styles.otpBox} ${
                        focusedIndex === index ? styles.otpBoxFocused : ''
                      } ${error ? styles.otpBoxError : ''}`}
                    >
                      <input
                        ref={(element) => {
                          inputRefs.current[index] = element
                        }}
                        className={styles.otpInput}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={digit}
                        aria-label={`Digit ${index + 1} of 6`}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        disabled={isSubmitting}
                        onFocus={() => setFocusedIndex(index)}
                        onChange={(event) => handleChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={(event) => handlePaste(event, index)}
                      />
                    </div>
                  ))}
                </div>
                <img
                  className={styles.groupDash}
                  src={otpGroupDash}
                  alt=""
                  width={4}
                  height={2}
                  aria-hidden="true"
                />
                <div className={styles.otpGroup}>
                  {digits.slice(3, 6).map((digit, offset) => {
                    const index = offset + 3
                    return (
                      <div
                        key={index}
                        className={`${styles.otpBox} ${
                          focusedIndex === index ? styles.otpBoxFocused : ''
                        } ${error ? styles.otpBoxError : ''}`}
                      >
                        <input
                          ref={(element) => {
                            inputRefs.current[index] = element
                          }}
                          className={styles.otpInput}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={1}
                          value={digit}
                          aria-label={`Digit ${index + 1} of 6`}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          disabled={isSubmitting}
                          onFocus={() => setFocusedIndex(index)}
                          onChange={(event) => handleChange(index, event.target.value)}
                          onKeyDown={(event) => handleKeyDown(index, event)}
                          onPaste={(event) => handlePaste(event, index)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {secondsLeft > 0 ? (
                <p className={styles.resend}>
                  <span className={styles.resendLabel}>I didn&apos;t receive a code </span>
                  <span className={styles.resendTimer}>{formatCountdown(secondsLeft)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={() => void handleResend()}
                  disabled={isResending}
                >
                  {isResending ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>

            {error ? (
              <p className={authStyles.error} id={errorId} role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${authStyles.primaryButton} ${
                isSubmitting ? authStyles.primaryButtonLoading : ''
              }`}
              disabled={!isComplete || isSubmitting}
            >
              {isSubmitting ? 'Verifying…' : 'Continue'}
            </button>
          </div>
        </div>

        <div className={styles.keypadDock}>
          <NumericKeypad
            onDigit={handleKeypadDigit}
            onBackspace={handleKeypadBackspace}
            disabled={isSubmitting || isResending}
          />
        </div>
      </form>
    </div>
  )
}
