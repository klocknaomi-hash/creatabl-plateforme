'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'
import { Sparkles, Check, Star, Users, ArrowUpRight } from 'lucide-react'

function SignUpContent() {
  const params = useSearchParams()
  
  useEffect(() => {
    const plan = params.get('plan')
    if (plan) {
      localStorage.setItem('selectedPlan', plan)
    }
  }, [params])

  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args)
      if (response.status === 400 || response.status === 422) {
        try {
          const clone = response.clone()
          const data = await clone.json()
          if (data.errors && data.errors.some((err: any) => err.code === 'form_identifier_exists')) {
            window.location.href = '/sign-in?message=account_exists'
          }
        } catch (e) {
          // Ignore
        }
      }
      return response
    }
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-[#14121F] text-white overflow-x-hidden">
      {/* Left Column - Beautiful Marketing Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#5B1BB8] via-[#14121F] to-[#5B1BB8] flex-col justify-between p-8 xl:p-12 h-screen max-h-screen overflow-hidden border-r border-white/5">
        {/* Decorative background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#7225E3]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7225E3]/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Brand Logo & Name (Exact official typography & layout) */}
        <div className="flex items-center gap-2.5 relative z-10 select-none">
          <img src="/logo.png" className="w-8 h-8 shrink-0" alt="creatabl.ia logo" />
          <span className="text-2xl font-bold tracking-tight text-white lowercase">
            creatabl<span className="font-playfair italic">.ia</span>
          </span>
        </div>

        {/* Main Content - Centered and compact to prevent scrolling */}
        <div className="flex-1 flex flex-col justify-center my-4 space-y-6 xl:space-y-7 relative z-10 max-w-md mx-auto w-full">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-white via-[#F8F7FC] to-[#878399] bg-clip-text text-transparent">
              Gérez tous vos réseaux.<br />Boostez votre croissance.
            </h1>
            <p className="text-[#6B6780] text-xs xl:text-sm leading-relaxed">
              Créez votre compte en quelques secondes et commencez à planifier, analyser et générer vos contenus de réseaux sociaux avec notre IA.
            </p>
          </div>

          {/* Feature list (Compact) */}
          <div className="space-y-2.5 xl:space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#7225E3]/10 border border-[#7225E3]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-[#7225E3]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Création assistée par IA</h3>
                <p className="text-xs xl:text-xs text-[#6B6780] mt-0.5">Publications sur-mesure et adaptées à votre cible en 1 clic.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#7225E3]/10 border border-[#7225E3]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-[#7225E3]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Planification intelligente</h3>
                <p className="text-xs xl:text-xs text-[#6B6780] mt-0.5">Publication automatique aux heures d&apos;engagement maximales.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#7225E3]/10 border border-[#7225E3]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-[#7225E3]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Analytics avancés</h3>
                <p className="text-xs xl:text-xs text-[#6B6780] mt-0.5">Suivi en temps réel de votre croissance d&apos;audience et de conversion.</p>
              </div>
            </div>
          </div>

          {/* Sleek Floating Analytics Card (Super compact to fit screen height) */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl relative overflow-hidden group hover:border-[#7225E3]/30 transition-all duration-500 w-full">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-tr from-transparent to-[#7225E3]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6B6780] uppercase tracking-widest">Performance Globale</span>
              <span className="flex items-center gap-0.5 text-xs text-[#0E7445] font-bold bg-[#0E7445]/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-2.5 h-2.5" /> +184%
              </span>
            </div>
            
            {/* Fake progress/charts */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-[#878399] mb-1 font-medium">
                  <span>Audience Totale</span>
                  <span className="font-bold text-white">21,456</span>
                </div>
                <div className="w-full h-1 rounded-full bg-[#2E2B3D] overflow-hidden">
                  <div className="w-[78%] h-full bg-gradient-to-r from-[#7225E3] to-[#7225E3] rounded-full" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs pt-1.5 border-t border-white/5 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7225E3]" />
                  <span className="text-[#6B6780]">LinkedIn</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7225E3]" />
                  <span className="text-[#6B6780]">Instagram</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A38F5]" />
                  <span className="text-[#6B6780]">Facebook</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof (Compact) */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <div className="flex -space-x-1.5">
              <div className="w-6.5 h-6.5 rounded-full border border-[#14121F] bg-gradient-to-tr from-pink-500 to-[#7225E3] flex items-center justify-center font-bold text-xs text-white">A</div>
              <div className="w-6.5 h-6.5 rounded-full border border-[#14121F] bg-gradient-to-tr from-[#7225E3] to-[#7225E3] flex items-center justify-center font-bold text-xs text-white">M</div>
              <div className="w-6.5 h-6.5 rounded-full border border-[#14121F] bg-gradient-to-tr from-[#0E7445] to-[#0E7445] flex items-center justify-center font-bold text-xs text-white">J</div>
              <div className="w-6.5 h-6.5 rounded-full border border-[#14121F] bg-gradient-to-tr from-[#8A4B00] to-[#8A4B00] flex items-center justify-center font-bold text-xs text-white">S</div>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-[#8A4B00] fill-[#8A4B00]" />
                ))}
              </div>
              <p className="text-xs xl:text-xs text-[#6B6780] mt-0.5 font-medium">Rejoignez +10 000 créateurs et marques d&apos;impact</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs xl:text-xs text-[#6B6780] relative z-10 font-medium mt-auto">
          <Users className="w-4 h-4 text-[#7225E3]" />
          <span>Essai gratuit de 14 jours sur les plans payants • Plan Free : 20 crédits par mois</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign Up (Light Theme for perfect readability) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F7FC] relative min-h-screen">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#7225E3]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* Small logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 select-none">
            <img src="/logo.png" className="w-7 h-7 shrink-0" alt="creatabl.ia logo" />
            <span className="text-xl font-bold tracking-tight text-[#14121F] lowercase">
              creatabl<span className="font-playfair italic text-[#14121F]">.ia</span>
            </span>
          </div>

          <SignUp
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
                logoPlacement: "none",
              },
              variables: {
                colorPrimary: '#7225E3',
                colorBackground: '#ffffff',
                colorText: '#14121F', // gray-800
                colorTextSecondary: '#4B4B63', // gray-600
                colorInputBackground: '#ffffff',
                colorInputText: '#14121F',
                colorBorder: '#E8E6F0', // gray-200
                borderRadius: '12px',
                fontFamily: 'inherit',
              },
              elements: {
                card: "shadow-xl border border-[#E8E6F0] p-6 bg-white w-full rounded-2xl",
                headerTitle: "text-2xl font-semibold text-[#14121F] text-center tracking-tight",
                headerSubtitle: "text-sm text-[#6B6780] text-center mt-1",
                socialButtonsBlockButton: "border border-[#E8E6F0] bg-white hover:bg-[#F8F7FC] text-[#4B4B63] font-semibold rounded-xl transition-all duration-200 py-3 shadow-sm",
                socialButtonsBlockButtonText: "text-sm font-medium",
                formButtonPrimary: "bg-[#7225E3] hover:bg-[#5B1BB8] text-white font-bold rounded-full py-3 shadow-lg shadow-[#7225E3]/10 active:scale-[0.98] transition-all",
                formFieldLabel: "text-[#4B4B63] font-semibold text-xs uppercase tracking-wider mb-1.5",
                formFieldInput: "border border-[#E8E6F0] focus:border-[#7225E3] focus:ring-1 focus:ring-[#7225E3] rounded-xl px-4 py-3 text-sm transition-all text-[#14121F] placeholder-gray-400 bg-white",
                footerActionText: "text-sm text-[#6B6780]",
                footerActionLink: "text-[#7225E3] hover:text-[#5B1BB8] font-bold transition-colors",
                dividerLine: "bg-[#F8F7FC]",
                dividerText: "text-[#6B6780] text-xs font-semibold bg-[#ffffff] px-3",
                identityPreviewText: "text-[#14121F]",
                identityPreviewEditButtonIcon: "text-[#7225E3]"
              }
            }}
            fallbackRedirectUrl="/sign-up/success"
            forceRedirectUrl="/sign-up/success"
            routing="path"
            path="/sign-up"
          />

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#14121F] text-white">Chargement...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
