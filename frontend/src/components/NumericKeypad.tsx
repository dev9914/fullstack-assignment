import styles from './NumericKeypad.module.css'

type NumericKeypadProps = {
  onDigit: (digit: string) => void
  onBackspace: () => void
  disabled?: boolean
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const

export default function NumericKeypad({
  onDigit,
  onBackspace,
  disabled = false,
}: NumericKeypadProps) {
  return (
    <div className={styles.wrap} role="group" aria-label="Numeric keypad">
      <div className={styles.grid}>
        {DIGIT_ROWS.flatMap((row) =>
          row.map((digit) => (
            <button
              key={digit}
              type="button"
              className={styles.key}
              disabled={disabled}
              aria-label={`Digit ${digit}`}
              onClick={() => onDigit(digit)}
            >
              {digit}
            </button>
          )),
        )}
        <span className={styles.spacer} aria-hidden="true" />
        <button
          type="button"
          className={styles.key}
          disabled={disabled}
          aria-label="Digit 0"
          onClick={() => onDigit('0')}
        >
          0
        </button>
        <button
          type="button"
          className={styles.key}
          disabled={disabled}
          aria-label="Backspace"
          onClick={onBackspace}
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
