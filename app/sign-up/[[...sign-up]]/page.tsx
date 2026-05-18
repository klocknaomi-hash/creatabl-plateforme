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
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">
      {/* Left Column - Beautiful Marketing Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Decorative background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full" />

        {/* Logo / Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#534AB7] to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Creatabl<span className="text-[#534AB7]">.ia</span>
          </span>
        </div>

        {/* Main Content */}
        <div className="my-auto space-y-10 relative z-10 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Gérez tous vos réseaux.<br />Boostez votre croissance.
            </h1>
            <p className="text-zinc-400 text-base">
              Créez votre compte en quelques secondes et commencez à planifier, analyser et générer vos contenus de réseaux sociaux avec notre IA.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Création assistée par IA</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Publications sur-mesure et adaptées à votre cible en 1 clic.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Planification intelligente</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Publication automatique aux heures d&apos;engagement maximales.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-[#534AB7]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Analytics avancés</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Suivi en temps réel de votre croissance d&apos;audience et de conversion.</p>
              </div>
            </div>
          </div>

          {/* Sleek Floating Analytics Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden group hover:border-[#534AB7]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-transparent to-[#534AB7]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Performance Global</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" /> +184%
              </span>
            </div>
            
            {/* Fake progress/charts */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1.5 font-medium">
                  <span>Audience Totale</span>
                  <span className="font-bold text-white">21,456</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="w-[78%] h-full bg-gradient-to-r from-[#534AB7] to-purple-500 rounded-full" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
                  <span className="text-zinc-400">LinkedIn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-zinc-400">Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-zinc-400">Facebook</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">A</div>
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-gradient-to-tr from-[#534AB7] to-purple-500 flex items-center justify-center font-bold text-xs text-white">M</div>
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-xs text-white">J</div>
              <div className="w-8 h-8 rounded-full border border-zinc-950 bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white">S</div>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Rejoignez +10 000 créateurs et marques d&apos;impact</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 relative z-10">
          <Users className="w-4 h-4 text-[#534AB7]" />
          <span>Essai gratuit de 14 jours • Aucune carte bancaire requise</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign Up */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#534AB7]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* Small logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#534AB7] to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
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
                colorBackground: '#09090b', // dark zinc-950
                colorText: '#f4f4f5', // zinc-100
                colorTextSecondary: '#a1a1aa', // zinc-400
                colorInputBackground: '#18181b', // zinc-900
                colorInputText: '#f4f4f5',
                colorBorder: '#27272a', // zinc-800
                borderRadius: '12px',
                fontFamily: 'inherit',
              },
              elements: {
                card: "shadow-none border-0 p-0 bg-transparent w-full",
                headerTitle: "text-2xl font-black text-white text-center tracking-tight",
                headerSubtitle: "text-sm text-zinc-400 text-center",
                socialButtonsBlockButton: "border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-xl transition-all duration-200 py-3",
                socialButtonsBlockButtonText: "text-sm font-medium",
                formButtonPrimary: "bg-[#534AB7] hover:bg-[#453da3] text-white font-bold rounded-xl py-3 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all",
                formFieldLabel: "text-zinc-300 font-medium text-xs uppercase tracking-wider mb-1.5",
                formFieldInput: "border border-zinc-800 focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] rounded-xl px-4 py-3 text-sm transition-all text-white placeholder-zinc-600 bg-zinc-900/30",
                footerActionText: "text-sm text-zinc-400",
                footerActionLink: "text-[#534AB7] hover:text-[#453da3] font-bold transition-colors",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500 text-xs font-semibold bg-zinc-950 px-3",
                identityPreviewText: "text-white",
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
