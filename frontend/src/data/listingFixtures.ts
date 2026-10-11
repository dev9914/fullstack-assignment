/**
 * TEMPORARY: Figma-visible content for frame 1:908 until
 * GET /v1/m/restaurant?city_id=118 response schema is confirmed.
 * Do not treat IDs or fields as API-backed.
 */

import bestSeller1 from '../assets/figma/best-seller-1-sushi.png'
import bestSeller2 from '../assets/figma/best-seller-2-curry.png'
import bestSeller3 from '../assets/figma/best-seller-3-lasagna.png'
import bestSeller4 from '../assets/figma/best-seller-4-cupcake.png'
import orderBurger from '../assets/figma/order-burger.png'
import orderShake from '../assets/figma/order-shake.png'
import orderShakeAlt from '../assets/figma/order-shake-alt.png'

export type BestSellerFixture = {
  /** Temporary slug for routing until restaurant API IDs are mapped */
  id: string
  priceLabel: string
  imageSrc: string
  imageAlt: string
}

export type OrderRowFixture = {
  title: string
  price: string
  dateTime: string
  itemCount: string
  imageSrc: string
  imageAlt: string
  primaryAction: 'cancel-filled' | 'cancel-outline'
}

export const listingLocation = {
  label: 'Current Locations',
  address: 'Model Town, New Delhi',
  userName: 'Karan',
}

export const bestSellerItems: BestSellerFixture[] = [
  {
    id: 'figma-best-seller-sushi',
    priceLabel: '$103.0',
    imageSrc: bestSeller1,
    imageAlt: 'Sushi rolls',
  },
  {
    id: 'figma-best-seller-curry',
    priceLabel: '$50.0',
    imageSrc: bestSeller2,
    imageAlt: 'Chicken curry with rice',
  },
  {
    id: 'figma-best-seller-lasagna',
    priceLabel: '$12.99',
    imageSrc: bestSeller3,
    imageAlt: 'Lasagna',
  },
  {
    id: 'figma-best-seller-cupcake',
    priceLabel: '$8.20',
    imageSrc: bestSeller4,
    imageAlt: 'Cupcake with berries',
  },
]

export const popularOrderRows: OrderRowFixture[] = [
  {
    title: 'Strawberry Shake',
    price: '₹20.00',
    dateTime: '29 Nov, 01:20 pm',
    itemCount: '2 items',
    imageSrc: orderShake,
    imageAlt: 'Strawberry shake',
    primaryAction: 'cancel-filled',
  },
  {
    title: 'Chicken Burger',
    price: '₹20.00',
    dateTime: '17 Oct, 01:20 pm',
    itemCount: '1 item',
    imageSrc: orderBurger,
    imageAlt: 'Chicken burger',
    primaryAction: 'cancel-filled',
  },
  {
    title: 'Sushi Wave',
    price: '$20.00',
    dateTime: '22 Apr, 01:20 pm',
    itemCount: '2 items',
    imageSrc: bestSeller1,
    imageAlt: 'Sushi wave',
    primaryAction: 'cancel-outline',
  },
  {
    title: 'Strawberry Shake',
    price: '$20.00',
    dateTime: '29 Nov, 01:20 pm',
    itemCount: '1 items',
    imageSrc: orderShakeAlt,
    imageAlt: 'Strawberry shake',
    primaryAction: 'cancel-outline',
  },
]

export const promoCarouselDotCount = 5
export const promoCarouselActiveIndex = 2
