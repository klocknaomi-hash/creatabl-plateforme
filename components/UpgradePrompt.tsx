'use client'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  requiredPlan: 'pro' | 'business'
}

export function UpgradePrompt({
  feature,
  requiredPlan
}: UpgradePromptProps) {
  const planName = requiredPlan === 'pro'
    ? 'Pro' : 'Business'
  const planPrice = requiredPlan === 'pro'
    ? '99€' : '199€'

  return (
    <div style={{
      background: 'rgba(127,119,221,0.08)',
      border: '1px solid rgba(127,119,221,0.3)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      marginTop: '8px',
    }}>
      <p style={{ fontSize: '13px', marginBottom: '8px' }}>
        🔒 {feature} est disponible à partir
        du plan {planName} ({planPrice}/mois)
      </p>
      <Link
        href="https://creatabl-ia.com/tarifs"
        style={{
          background: '#7F77DD',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Passer au plan {planName} →
      </Link>
    </div>
  )
}
