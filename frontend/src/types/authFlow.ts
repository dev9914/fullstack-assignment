export type AuthFlowState = {
  /** 10-digit national number sent as `phone` */
  phone: string
  dialCode: string
  /** Display string on OTP screen, e.g. +91 98189 79450 */
  displayPhone: string
}
