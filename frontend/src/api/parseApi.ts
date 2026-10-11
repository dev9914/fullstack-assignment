/** Helpers for unknown Fastor JSON bodies — only fields confirmed in Postman or observed live. */

export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['message', 'error', 'msg'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
    const errors = record.errors
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0]
      if (typeof first === 'string') {
        return first
      }
    }
  }
  return fallback
}

/** Postman: JWT at response.data.token (JSON body `{ data: { token } }` or `{ token }`). */
export function extractAuthToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  const root = data as Record<string, unknown>
  if (typeof root.token === 'string' && root.token.length > 0) {
    return root.token
  }
  const nested = root.data
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>
    if (typeof inner.token === 'string' && inner.token.length > 0) {
      return inner.token
    }
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }
  return undefined
}

function pickImageUrl(record: Record<string, unknown>): string | undefined {
  return pickString(record, [
    'image',
    'image_url',
    'imageUrl',
    'logo',
    'logo_url',
    'thumbnail',
    'thumb',
    'banner',
    'photo',
  ])
}

export type ParsedRestaurant = {
  id: string
  name: string
  imageUrl?: string
  address?: string
}

function pickAddress(record: Record<string, unknown>): string | undefined {
  const value = pickString(record, ['address_complete', 'address', 'full_address', 'location'])
  if (!value) {
    return undefined
  }
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null') {
    return undefined
  }
  return trimmed
}

function mapRestaurantRecord(record: Record<string, unknown>): ParsedRestaurant | null {
  const id = pickString(record, ['id', 'restaurant_id', 'restaurantId'])
  const name = pickString(record, ['name', 'restaurant_name', 'title', 'restaurantName'])
  if (!id || !name) {
    return null
  }
  const imageUrl = pickImageUrl(record)
  const address = pickAddress(record)
  const result: ParsedRestaurant = { id, name }
  if (imageUrl) {
    result.imageUrl = imageUrl
  }
  if (address) {
    result.address = address
  }
  return result
}

function restaurantsFromArray(items: unknown[]): ParsedRestaurant[] {
  const out: ParsedRestaurant[] = []
  for (const item of items) {
    if (isRecord(item)) {
      const mapped = mapRestaurantRecord(item)
      if (mapped) {
        out.push(mapped)
      }
    }
  }
  return out
}

/** Best-effort list extraction until live schema is confirmed. */
export function parseRestaurantsResponse(data: unknown): ParsedRestaurant[] {
  if (Array.isArray(data)) {
    return restaurantsFromArray(data)
  }
  if (!isRecord(data)) {
    return []
  }

  const direct = data.restaurants ?? data.list ?? data.items ?? data.results
  if (Array.isArray(direct)) {
    return restaurantsFromArray(direct)
  }

  const nested = data.data
  if (Array.isArray(nested)) {
    return restaurantsFromArray(nested)
  }
  if (isRecord(nested)) {
    const inner = nested.restaurants ?? nested.list ?? nested.items ?? nested.results
    if (Array.isArray(inner)) {
      return restaurantsFromArray(inner)
    }
  }

  return []
}
