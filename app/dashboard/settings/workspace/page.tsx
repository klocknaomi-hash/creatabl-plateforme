'use client'

import { OrganizationProfile } from '@clerk/nextjs'
import { Building2 } from 'lucide-react'

export default function WorkspacePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
            <Building2 className="size-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion de l'organisation</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-10">
          Gérez le nom, le logo, les membres et les paramètres de votre organisation.
        </p>
      </div>

      {/* Organization Profile Component */}
      <div className="flex justify-center w-full">
        <OrganizationProfile
          routing="hash"
          appearance={{
            variables: {
              colorPrimary: '#7C3AED',
              colorBackground: '#ffffff',
              colorText: '#18181b',
              colorTextSecondary: '#71717a',
              colorInputBackground: '#ffffff',
              colorInputText: '#18181b',
              colorBorder: '#e4e4e7',
              borderRadius: '1rem',
              fontFamily: 'inherit',
            },
            elements: {
              rootBox: 'w-full shadow-none border border-border/60 rounded-2xl overflow-hidden bg-card',
              cardBox: 'w-full shadow-none border-none bg-transparent',
              navbar: 'border-r border-border/50 bg-muted/20 p-4',
              navbarButton: 'rounded-xl text-sm font-medium hover:bg-muted text-muted-foreground transition-all',
              navbarButtonActive: 'bg-[#7C3AED]/10 text-[#7C3AED] font-semibold hover:bg-[#7C3AED]/15',
              pageScrollBox: 'p-6 sm:p-8',
              headerTitle: 'text-xl font-bold text-foreground tracking-tight',
              headerSubtitle: 'text-sm text-muted-foreground',
              profileSectionTitle: 'border-b border-border/40 pb-2 text-base font-semibold text-foreground',
              formButtonPrimary: 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-xl shadow-sm transition-all',
              formButtonReset: 'rounded-xl text-muted-foreground hover:bg-muted',
              dangerBox: 'border border-destructive/20 bg-destructive/5 rounded-2xl p-4',
            },
          }}
        />
      </div>
    </div>
  )
}
