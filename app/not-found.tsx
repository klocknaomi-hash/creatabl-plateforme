'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function NotFound() {
  const pathname = usePathname()
  const [videoError, setVideoError] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      gap: '1.5rem',
    }}>
      <p style={{
        fontSize: '12px',
        color: '#555552',
        fontFamily: 'monospace',
        position: 'absolute',
        top: '24px',
        left: '24px',
      }}>
        app.creatabl-ia.com › {pathname}
      </p>

      <div style={{
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(127,119,221,0.35)',
      }}>
        {!videoError ? (
          <video
            src="/mascot-404.mp4"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <img
            src="/mascot-404.png"
            alt="Mascotte 404"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      <p style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#7F77DD',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        Erreur 404
      </p>

      <h1 style={{
        fontSize: 'clamp(24px, 4vw, 42px)',
        fontWeight: 700,
        color: '#FFFFFF',
        lineHeight: 1.2,
        maxWidth: '500px',
      }}>
        Cette page n&apos;est pas encore prête ✨
      </h1>

      <p style={{
        fontSize: '15px',
        color: '#777774',
        lineHeight: 1.7,
        maxWidth: '380px',
      }}>
        On travaille dessus. En attendant,
        retourne au dashboard.
      </p>

      <Link
        href="/dashboard"
        style={{
          background: '#7F77DD',
          color: '#FFFFFF',
          padding: '13px 32px',
          borderRadius: '100px',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        ← Retour au dashboard
      </Link>
    </div>
  )
}
