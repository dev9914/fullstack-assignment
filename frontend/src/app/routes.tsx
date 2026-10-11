import { Route, Routes } from 'react-router-dom'
import OtpPage from '../pages/OtpPage'
import RegisterPage from '../pages/RegisterPage'
import RestaurantDetailPage from '../pages/RestaurantDetailPage'
import RestaurantListPage from '../pages/RestaurantListPage'
import MobileLayout from './MobileLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
      </Route>
    </Routes>
  )
}
