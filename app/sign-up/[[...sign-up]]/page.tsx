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

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Left Column - Beautiful Marketing Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 flex-col justify-between p-12 overflow-y-auto border-r border-white/5">
        {/* Decorative background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Logo / Header */}
        <div className="flex items-center gap-2 relative z-10 select-none">
          <span className="text-2xl font-black tracking-tight text-white">
            Creatabl<span className="text-[#534AB7]">.ia</span>
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center my-10 space-y-10 relative z-10 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Gerez tous vos réseaux.<br />Boostez votre croissance.
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Créez votre compte en quelques secondes et commencez à planifier, analyser et générer vos contenus de réseaux sociaux avec notre IA.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-5.5 h-5.5 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Création assistée par IA</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Publications sur-mesure et adaptées à votre cible en 1 clic.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5.5 h-5.5 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Planification intelligente</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Publication automatique aux heures d&apos;engagement maximales.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5.5 h-5.5 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Analytics avancés</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Suivi en temps réel de votre croissance d&apos;audience et de conversion.</p>
              </div>
            </div>
          </div>

          {/* Sleek Floating Analytics Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden group hover:border-[#534AB7]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr from-transparent to-[#534AB7]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Performance Globale</span>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> +184%
              </span>
            </div>
            
            {/* Fake progress/charts */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-300 mb-1 font-medium">
                  <span>Audience Totale</span>
                  <span className="font-bold text-white">21,456</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="w-[78%] h-full bg-gradient-to-r from-[#534AB7] to-purple-500 rounded-full" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] pt-1.5 border-t border-white/5 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
                  <span className="text-zinc-400">LinkedIn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-zinc-400">Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-zinc-400">Facebook</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border border-zinc-950 bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center font-bold text-[10px] text-white">A</div>
              <div className="w-7 h-7 rounded-full border border-zinc-950 bg-gradient-to-tr from-[#534AB7] to-purple-500 flex items-center justify-center font-bold text-[10px] text-white">M</div>
              <div className="w-7 h-7 rounded-full border border-zinc-950 bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-[10px] text-white">J</div>
              <div className="w-7 h-7 rounded-full border border-zinc-950 bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-[10px] text-white">S</div>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Rejoignez +10 000 créateurs et marques d&apos;impact</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 relative z-10 font-medium">
          <Users className="w-4 h-4 text-[#534AB7]" />
          <span>Essai gratuit de 7 jours • Aucune carte bancaire requise</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign Up (Light Theme for perfect readability) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F9FD] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#534AB7]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* Small logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8 select-none">
            <span className="text-2xl font-black tracking-tight text-zinc-900">
              Creatabl<span className="text-[#534AB7]">.ia</span>
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
                colorPrimary: '#534AB7',
                colorBackground: '#ffffff',
                colorText: '#1f2937', // gray-800
                colorTextSecondary: '#4b5563', // gray-600
                colorInputBackground: '#ffffff',
                colorInputText: '#1f2937',
                colorBorder: '#e5e7eb', // gray-200
                borderRadius: '12px',
                fontFamily: 'inherit',
              },
              elements: {
                card: "shadow-xl border border-gray-100 p-6 bg-white w-full rounded-2xl",
                headerTitle: "text-2xl font-black text-gray-900 text-center tracking-tight",
                headerSubtitle: "text-sm text-gray-500 text-center mt-1",
                socialButtonsBlockButton: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 py-3 shadow-sm",
                socialButtonsBlockButtonText: "text-sm font-medium",
                formButtonPrimary: "bg-[#534AB7] hover:bg-[#453da3] text-white font-bold rounded-xl py-3 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all",
                formFieldLabel: "text-gray-700 font-semibold text-xs uppercase tracking-wider mb-1.5",
                formFieldInput: "border border-gray-200 focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] rounded-xl px-4 py-3 text-sm transition-all text-gray-900 placeholder-gray-400 bg-white",
                footerActionText: "text-sm text-gray-500",
                footerActionLink: "text-[#534AB7] hover:text-[#453da3] font-bold transition-colors",
                dividerLine: "bg-gray-100",
                dividerText: "text-gray-400 text-xs font-semibold bg-white px-3",
                identityPreviewText: "text-gray-900",
                identityPreviewEditButtonIcon: "text-[#534AB7]"
              }
            }}
            fallbackRedirectUrl="/dashboard"
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Chargement...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
