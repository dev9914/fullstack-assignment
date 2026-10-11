import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchRestaurants, type ParsedRestaurant } from '../api/restaurants'
import { clearAuthToken, getAuthToken } from '../api/session'
import iconPhone from '../assets/figma/icon-phone.svg'
import iconWallet from '../assets/figma/icon-wallet.svg'
import promoBannerBg from '../assets/figma/promo-banner-bg.svg'
import promoDecoBottom from '../assets/figma/promo-deco-bottom.svg'
import promoDecoTop from '../assets/figma/promo-deco-top.svg'
import promoPizza from '../assets/figma/promo-pizza.png'
import rowDivider from '../assets/figma/row-divider.svg'
import {
  bestSellerItems,
  listingLocation,
  popularOrderRows,
  promoCarouselActiveIndex,
  promoCarouselDotCount,
} from '../data/listingFixtures'
import styles from './RestaurantListPage.module.css'

export default function RestaurantListPage() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<ParsedRestaurant[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set())

  const handleImageError = (id: string) => {
    setBrokenImageIds((prev) => {
      if (prev.has(id)) {
        return prev
      }
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    const load = async () => {
      setLoadState('loading')
      setFetchError(null)
      try {
        const list = await fetchRestaurants()
        if (!cancelled) {
          setRestaurants(list)
          setLoadState('ready')
        }
      } catch (err) {
        if (cancelled) {
          return
        }
        const message =
          err instanceof Error ? err.message : 'Could not load restaurants.'
        setFetchError(message)
        setLoadState('error')
        if (message.includes('session expired')) {
          clearAuthToken()
          navigate('/', { replace: true })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className={styles.page}>
      <header className={styles.locationBar}>
        <p className={styles.locationLabel}>{listingLocation.label}</p>
        <p className={styles.locationAddress}>{listingLocation.address}</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.nameChip} aria-label="User name">
          {listingLocation.userName}
        </div>
        <div className={styles.toolbarSpacer} />
        <button type="button" className={styles.iconTilePhone} aria-label="Call support">
          <img src={iconPhone} alt="" width={22} height={22} />
        </button>
        <button type="button" className={styles.iconTileWallet} aria-label="Wallet">
          <img src={iconWallet} alt="" width={22} height={22} />
        </button>
      </div>

      {loadState === 'loading' ? (
        <p className={styles.apiStatus} role="status">
          Loading restaurants…
        </p>
      ) : null}

      {fetchError && loadState === 'error' ? (
        <p className={styles.apiError} role="alert">
          {fetchError}
        </p>
      ) : null}

      {loadState === 'ready' && restaurants.length === 0 ? (
        <p className={styles.apiStatus} role="status">
          No restaurants returned for this city.
        </p>
      ) : null}

      {restaurants.length > 0 ? (
        <section className={styles.section} aria-labelledby="api-restaurants-heading">
          <h2 id="api-restaurants-heading" className={styles.sectionTitle}>
            Restaurants
          </h2>
          <ul className={styles.apiRestaurantList}>
            {restaurants.map((item) => {
              const imageBroken = brokenImageIds.has(item.id)
              const showThumb = item.imageUrl && !imageBroken
              return (
                <li key={item.id}>
                  <Link to={`/restaurants/${item.id}`} className={styles.apiRestaurantRow}>
                    {showThumb ? (
                      <img
                        className={styles.apiRestaurantThumb}
                        src={item.imageUrl}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <span className={styles.apiRestaurantThumbPlaceholder} aria-hidden="true" />
                    )}
                    <span className={styles.apiRestaurantText}>
                      <span className={styles.apiRestaurantName}>{item.name}</span>
                      {item.address ? (
                        <span className={styles.apiRestaurantAddress}>{item.address}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="best-seller-heading">
        <h2 id="best-seller-heading" className={styles.sectionTitle}>
          Best Seller
        </h2>
        <div className={styles.bestSellerScroll}>
          {bestSellerItems.map((item, index) => (
            <Link
              key={item.id}
              to={`/restaurants/${item.id}`}
              className={styles.bestSellerCard}
              aria-label={`View ${item.imageAlt}, ${item.priceLabel}`}
            >
              <img
                className={
                  index === 2 ? styles.bestSellerImageCrop : styles.bestSellerImage
                }
                src={item.imageSrc}
                alt={item.imageAlt}
                width={72}
                height={108}
              />
              <span className={styles.pricePill}>{item.priceLabel}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Promotion">
        <div className={styles.promoWrap}>
          <div className={styles.promoBanner}>
            <img className={styles.promoBg} src={promoBannerBg} alt="" />
            <img className={styles.promoDecoTop} src={promoDecoTop} alt="" aria-hidden="true" />
            <img className={styles.promoDecoBottom} src={promoDecoBottom} alt="" aria-hidden="true" />
            <img className={styles.promoPizza} src={promoPizza} alt="" />
            <div className={styles.promoCopy}>
              <p className={styles.promoSubtitle}>Experience our delicious new dish</p>
              <p className={styles.promoTitle}>30% OFF</p>
            </div>
          </div>
          <div className={styles.carouselDots} aria-hidden="true">
            {Array.from({ length: promoCarouselDotCount }, (_, index) => (
              <span
                key={index}
                className={`${styles.carouselDot} ${
                  index === promoCarouselActiveIndex ? styles.carouselDotActive : ''
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="popular-items-heading">
        <h2 id="popular-items-heading" className={styles.sectionTitle}>
          Popular Items
        </h2>
        <div className={styles.orderList}>
          {popularOrderRows.map((row, index) => (
            <article key={`${row.title}-${index}`} className={styles.orderRow}>
              <div className={styles.orderRowInner}>
                <img
                  className={styles.orderThumb}
                  src={row.imageSrc}
                  alt={row.imageAlt}
                  width={72}
                  height={108}
                />
                <div className={styles.orderMetaRow}>
                  <h3 className={styles.orderTitle}>{row.title}</h3>
                  <p className={styles.orderPrice}>{row.price}</p>
                </div>
                <div className={styles.orderMetaRow}>
                  <p className={styles.orderMeta}>{row.dateTime}</p>
                  <p className={styles.orderMeta}>{row.itemCount}</p>
                </div>
                <div className={styles.orderActions}>
                  <button
                    type="button"
                    className={
                      row.primaryAction === 'cancel-filled'
                        ? styles.pillPrimary
                        : styles.pillOutline
                    }
                  >
                    Cancel Order
                  </button>
                  <button type="button" className={styles.pillSecondary}>
                    Track Driver
                  </button>
                </div>
              </div>
              {index < popularOrderRows.length - 1 ? (
                <img className={styles.rowDivider} src={rowDivider} alt="" />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
