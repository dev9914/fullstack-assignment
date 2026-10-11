import { apiClient, getErrorMessage, isUnauthorizedError, restaurantCityId } from './client'
import { parseRestaurantsResponse, type ParsedRestaurant } from './parseApi'

export async function fetchRestaurants(): Promise<ParsedRestaurant[]> {
  try {
    const response = await apiClient.get('/v1/m/restaurant', {
      params: { city_id: restaurantCityId },
    })
    return parseRestaurantsResponse(response.data)
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw new Error('Your session expired. Please sign in again.', { cause: error })
    }
    throw new Error(getErrorMessage(error, 'Could not load restaurants. Please try again.'), {
      cause: error,
    })
  }
}

export type { ParsedRestaurant }
