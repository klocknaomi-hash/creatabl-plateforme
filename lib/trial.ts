export function getTrialStatus(user: {
  trialStartedAt?: Date | null
  trialEndsAt: Date | null
  isSubscribed: boolean
}) {
  if (user.isSubscribed) {
    return { status: 'active', daysLeft: null }
  }
  
  if (!user.trialEndsAt) {
    return { status: 'no_trial', daysLeft: null }
  }
  
  const now = new Date()
  const endsAt = new Date(user.trialEndsAt)
  const diffTime = endsAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (daysLeft > 0) {
    return { status: 'trial', daysLeft }
  }
  
  return { status: 'expired', daysLeft: 0 }
}
