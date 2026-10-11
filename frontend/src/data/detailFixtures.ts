/**
 * TEMPORARY product detail fixtures (Figma frame 1:1343 + listing slugs).
 * Not backed by GET /v1/m/restaurant or any verified API schema.
 */

import productHero from '../assets/figma/product-hero-pizza.png'
import { bestSellerItems } from './listingFixtures'

export type PortionOption = {
  id: string
  label: string
  /** Additional charge from Figma ($0.00 – $10.00 labels) */
  addonAmount: number
  addonCurrency: 'USD'
}

export type ProductDetailFixture = {
  id: string
  title: string
  description: string
  /** Base price shown as ₹14.00 in Figma */
  basePriceInr: number
  heroSrc: string
  heroAlt: string
  portions: PortionOption[]
  defaultPortionId: string
}

const FIGMA_PORTIONS: PortionOption[] = [
  { id: 'personal', label: 'Personal (4 Slides)', addonAmount: 0, addonCurrency: 'USD' },
  { id: 'medium', label: 'Medium (8 Slides)', addonAmount: 3, addonCurrency: 'USD' },
  { id: 'familiar', label: 'Familiar (10 Slides)', addonAmount: 6, addonCurrency: 'USD' },
  { id: 'jumbo', label: 'Jumbo (12 Slides)', addonAmount: 10, addonCurrency: 'USD' },
]

const defaultDetailProduct: Omit<ProductDetailFixture, 'id'> = {
  title: 'Lorem ipsum dolor sit amet',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
  basePriceInr: 14,
  heroSrc: productHero,
  heroAlt: 'Pepperoni pizza with basil',
  portions: FIGMA_PORTIONS,
  defaultPortionId: 'jumbo',
}

/** Figma reference product for any best-seller slug until API mapping exists */
export function getProductDetailById(id: string | undefined): ProductDetailFixture | null {
  if (!id) {
    return null
  }

  const seller = bestSellerItems.find((item) => item.id === id)
  if (!seller) {
    return null
  }

  return {
    id: seller.id,
    ...defaultDetailProduct,
    heroSrc: seller.imageSrc,
    heroAlt: seller.imageAlt,
    title: seller.imageAlt,
  }
}

export function formatUnitPriceInr(basePriceInr: number, addonAmount: number): number {
  return basePriceInr + addonAmount
}

export function formatInr(amount: number): string {
  return `₹${amount.toFixed(2)}`
}

export function formatUsdAddon(amount: number): string {
  return `$${amount.toFixed(2)}`
}
