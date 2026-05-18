import { SignIn } from '@clerk/nextjs'
import { Shield } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Left Column - Beautiful Marketing Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 flex-col justify-between p-8 xl:p-12 h-screen max-h-screen overflow-hidden border-r border-white/5">
        {/* Decorative background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Brand Logo & Name (Exact official typography & layout) */}
        <div className="flex items-center gap-2.5 relative z-10 select-none">
          <img src="/logo.svg" className="w-8 h-8 shrink-0" alt="creatabl.ia logo" />
          <span className="text-2xl font-bold tracking-tight text-white lowercase">
            creatabl<span className="font-serif italic">.ia</span>
          </span>
        </div>

        {/* Main Content - Centered and compact to prevent scrolling */}
        <div className="flex-1 flex flex-col justify-center my-4 space-y-6 xl:space-y-8 relative z-10 max-w-md mx-auto w-full">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Optimisez votre impact sur les réseaux.
            </h1>
            <p className="text-zinc-400 text-xs xl:text-sm leading-relaxed">
              Planifiez vos publications, analysez vos performances et générez du contenu ultra-captivant grâce à notre intelligence artificielle conçue pour votre marque.
            </p>
          </div>

          {/* Premium Instagram Post Branding Mockup (Squares nicely to fit height) */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl relative group hover:border-[#534AB7]/30 transition-all duration-500 max-w-[320px] xl:max-w-[350px] mx-auto w-full">
            <img src="/post-preview.png" className="w-full h-auto object-cover" alt="Instagram Post Preview" />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-[10px] xl:text-[11px] text-zinc-500 relative z-10 font-medium mt-auto">
          <Shield className="w-4 h-4 text-[#534AB7]" />
          <span>Plateforme sécurisée de niveau entreprise • RGPD Compliant</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign In (Light Theme for perfect readability) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F9FD] relative min-h-screen">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#534AB7]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          {/* Small logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 select-none">
            <img src="/logo.svg" className="w-7 h-7 shrink-0" alt="creatabl.ia logo" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 lowercase">
              creatabl<span className="font-serif italic text-zinc-950">.ia</span>
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
            path="/sign-in"
          />
        </div>
      </div>
    </div>
  )
}
