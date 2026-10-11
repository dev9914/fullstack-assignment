import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import arrowBack from '../assets/figma/arrow-back.svg'
import detailDivider from '../assets/figma/detail-divider.svg'
import qtyMinus from '../assets/figma/qty-minus.svg'
import qtyPlus from '../assets/figma/qty-plus.svg'
import radioEmpty from '../assets/figma/radio-empty.svg'
import radioFilled from '../assets/figma/radio-filled.svg'
import {
  formatInr,
  formatUnitPriceInr,
  formatUsdAddon,
  getProductDetailById,
  type ProductDetailFixture,
} from '../data/detailFixtures'
import authStyles from '../styles/authScreen.module.css'
import styles from './RestaurantDetailPage.module.css'

type ProductDetailContentProps = {
  product: ProductDetailFixture
}

function ProductDetailContent({ product }: ProductDetailContentProps) {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [portionId, setPortionId] = useState(product.defaultPortionId)
  const [cartMessage, setCartMessage] = useState<string | null>(null)

  const selectedPortion = useMemo(
    () => product.portions.find((option) => option.id === portionId),
    [product, portionId],
  )

  const unitPrice = useMemo(() => {
    if (!selectedPortion) {
      return product.basePriceInr
    }
    return formatUnitPriceInr(product.basePriceInr, selectedPortion.addonAmount)
  }, [product.basePriceInr, selectedPortion])

  const totalPrice = unitPrice * quantity

  const handleAddToCart = () => {
    const portionLabel = selectedPortion?.label ?? 'Selected portion'
    setCartMessage(
      `Added ${quantity} × ${product.title} (${portionLabel}) — ${formatInr(totalPrice)}. Demo cart only; no order placed.`,
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.scroll}>
        <button
          type="button"
          className={styles.back}
          aria-label="Back to listing"
          onClick={() => navigate('/restaurants')}
        >
          <img src={arrowBack} alt="" width={24} height={24} />
        </button>

        <img
          className={styles.hero}
          src={product.heroSrc}
          alt={product.heroAlt}
          width={323}
          height={223}
        />

        <div className={styles.priceRow}>
          <p className={styles.price}>{formatInr(unitPrice)}</p>
          <div className={styles.stepper} aria-label="Quantity">
            <button
              type="button"
              className={styles.stepperButton}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <img src={qtyMinus} alt="" width={26} height={26} />
            </button>
            <span className={styles.stepperValue} aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className={styles.stepperButton}
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => value + 1)}
            >
              <img src={qtyPlus} alt="" width={26} height={26} />
            </button>
          </div>
        </div>

        <img className={styles.divider} src={detailDivider} alt="" aria-hidden="true" />

        <h1 className={styles.productTitle}>{product.title}</h1>
        <p className={styles.description}>{product.description}</p>

        <img className={styles.divider} src={detailDivider} alt="" aria-hidden="true" />

        <section className={styles.portionSection} aria-labelledby="portion-heading">
          <h2 id="portion-heading" className={styles.portionHeading}>
            Personal portion
          </h2>
          <ul className={styles.portionList}>
            {product.portions.map((option) => {
              const isSelected = option.id === portionId
              return (
                <li key={option.id} className={styles.portionOption}>
                  <label className={styles.portionLabel}>
                    <span className={styles.portionName}>{option.label}</span>
                    <span className={styles.portionAddon}>
                      {formatUsdAddon(option.addonAmount)}
                    </span>
                    <input
                      className={styles.portionInput}
                      type="radio"
                      name="portion"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setPortionId(option.id)}
                    />
                    <span className={styles.portionRadio} aria-hidden="true">
                      <img
                        src={isSelected ? radioFilled : radioEmpty}
                        alt=""
                        width={15}
                        height={15}
                      />
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {cartMessage ? (
            <p className={styles.cartNotice} role="status" aria-live="polite">
              {cartMessage}
            </p>
          ) : null}
          <button
            type="button"
            className={authStyles.primaryButton}
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        </div>
      </footer>
    </div>
  )
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = getProductDetailById(id)

  if (!product) {
    return <Navigate to="/restaurants" replace />
  }

  return <ProductDetailContent key={product.id} product={product} />
}
