import { Outlet, useLocation } from 'react-router-dom'
import styles from './MobileLayout.module.css'

export default function MobileLayout() {
  const { pathname } = useLocation()
  const isScrollableListing =
    pathname === '/restaurants' || /^\/restaurants\/.+/.test(pathname)

  return (
    <div className={styles.shell}>
      <div className={isScrollableListing ? styles.frameScroll : styles.frame}>
        <Outlet />
      </div>
    </div>
  )
}
