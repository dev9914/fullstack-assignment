import styles from './PagePlaceholder.module.css'

type PagePlaceholderProps = {
  heading: string
  note: string
  variant: 'auth' | 'food'
}

export function PagePlaceholder({ heading, note, variant }: PagePlaceholderProps) {
  const className = variant === 'auth' ? styles.auth : styles.food

  return (
    <section className={className}>
      <h1 className={styles.heading}>{heading}</h1>
      <p className={styles.note}>{note}</p>
    </section>
  )
}
