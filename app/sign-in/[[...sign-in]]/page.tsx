import { SignIn } from '@clerk/nextjs'
import { Sparkles, MessageSquare, Heart, Share2, Shield } from 'lucide-react'

export default function Page() {
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

        {/* Main Content & Mockup */}
        <div className="my-auto space-y-12 relative z-10 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Optimisez votre impact sur les réseaux.
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Planifiez vos publications, analysez vos performances et générez du contenu ultra-captivant grâce à notre intelligence artificielle conçue pour votre marque.
            </p>
          </div>

          {/* Premium Mobile Post Mockup */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl relative group hover:border-[#534AB7]/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#534AB7] to-purple-500 flex items-center justify-center font-bold text-sm text-white">
                  C
                </div>
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                    Creatabl.ia <span className="text-xs text-[#534AB7] bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">IA active</span>
                  </div>
                  <div className="text-xs text-zinc-500">Aperçu du Post • Rédigé en 3s</div>
                </div>
              </div>
              <div className="text-xs font-bold text-[#534AB7] bg-[#534AB7]/10 px-3 py-1.5 rounded-xl border border-[#534AB7]/20">
                Instagram / LinkedIn
              </div>
            </div>

            {/* Post Content Mock */}
            <div className="space-y-3 mb-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                🚀 Arrêtez de passer des heures à chercher quoi publier. L&apos;IA de <span className="text-[#534AB7] font-semibold">Creatabl.ia</span> s&apos;adapte à votre identité de marque pour créer des posts uniques en un clic.
              </p>
              <div className="h-44 w-full rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                <Sparkles className="w-12 h-12 text-[#534AB7]/50 animate-pulse" />
              </div>
            </div>

            {/* Simulated Post Metrics */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-zinc-500 text-xs">
              <div className="flex gap-4">
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Heart className="w-4 h-4" /> 142</span>
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><MessageSquare className="w-4 h-4" /> 24</span>
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Share2 className="w-4 h-4" /> 8</span>
              </div>
              <span className="text-[#534AB7] font-bold">Engagement +18.4% 🔥</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 relative z-10">
          <Shield className="w-4 h-4 text-[#534AB7]" />
          <span>Plateforme sécurisée de niveau entreprise • RGPD Compliant</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign In */}
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

          <SignIn
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
            path="/sign-in"
          />
        </div>
      </div>
    </div>
  )
}
