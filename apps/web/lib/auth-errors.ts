/** Friendly, actionable Supabase Auth error copy. Never imply an account was created on a rejected request. */
export function authErrorMessage(error: unknown): { message: string; emailDeliveryBlocked: boolean } {
  const value = error && typeof error === 'object' ? error as { code?: string; message?: string; status?: number } : {}
  const code = value.code || ''
  const message = value.message || ''
  const normalized = message.toLowerCase()
  if (code === 'over_email_send_rate_limit' || normalized.includes('email rate limit exceeded')) {
    return { emailDeliveryBlocked: true, message: 'Confirmation emails have reached the current sending limit. Account creation cannot finish right now. You can continue exploring JobPulse as a guest. The JobPulse team needs to enable a dedicated email provider for reliable signups.' }
  }
  if (code === 'email_address_not_authorized' || normalized.includes('email address not authorized')) {
    return { emailDeliveryBlocked: true, message: 'The email service cannot send a confirmation to this address yet. The JobPulse team needs to configure a production email provider. You can continue as a guest.' }
  }
  if (value.status === 429 || code.includes('rate_limit')) {
    return { emailDeliveryBlocked: false, message: 'Too many authentication requests were made. Please try again later. You can still explore JobPulse as a guest.' }
  }
  if (code === 'invalid_credentials') {
    return { emailDeliveryBlocked: false, message: 'The email or password did not match an existing account. Check your details and try again.' }
  }
  if (code === 'email_not_confirmed') {
    return { emailDeliveryBlocked: false, message: 'Please confirm your email address before signing in. If you have not received a message, ask the JobPulse team to check email delivery.' }
  }
  if (code === 'weak_password') {
    return { emailDeliveryBlocked: false, message: 'Please choose a stronger password and try again.' }
  }
  return { emailDeliveryBlocked: false, message: message || 'Authentication was unsuccessful. Please try again.' }
}
