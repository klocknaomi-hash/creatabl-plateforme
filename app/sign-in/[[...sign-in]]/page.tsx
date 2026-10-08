'use client'

import { useState, Suspense } from 'react'
import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Shield, Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, BarChart2, Bookmark, Send } from 'lucide-react'

function SignInContent() {
  const [activeTab, setActiveTab] = useState<'instagram' | 'twitter' | 'linkedin'>('instagram')
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

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
              Optimisez votre impact sur les réseaux.
            </h1>
            <p className="text-[#6B6780] text-xs xl:text-sm leading-relaxed">
              Planifiez vos publications, analysez vos performances et générez du contenu ultra-captivant grâce à notre intelligence artificielle conçue pour votre marque.
            </p>
          </div>

          {/* Platform Tab Selector (Mimics the exact format of the Creatabl platform) */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 max-w-[320px] xl:max-w-[350px] mx-auto w-full">
            {(['instagram', 'twitter', 'linkedin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs xl:text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#7225E3] text-white shadow-md shadow-[#7225E3]/10'
                    : 'text-[#6B6780] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'twitter' ? 'X / Twitter' : tab}
              </button>
            ))}
          </div>

          {/* Interactive Post Preview Container (Exact platform format) */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl relative max-w-[320px] xl:max-w-[350px] mx-auto w-full transition-all duration-300">
            
            {/* 1. INSTAGRAM FORMAT */}
            {activeTab === 'instagram' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-white/5 bg-[#14121F]/20">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" className="w-8 h-8 rounded-full border border-white/10 p-0.5 bg-[#14121F]" alt="" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        creatabl.ia <span className="w-1.5 h-1.5 rounded-full bg-[#0E7445]"></span>
                      </span>
                      <span className="text-xs text-[#6B6780] font-medium">Paris, France</span>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-[#6B6780]" />
                </div>
                {/* Media */}
                <div className="aspect-square bg-[#14121F] overflow-hidden">
                  <img src="/post-preview.png" className="w-full h-full object-cover" alt="Instagram preview" />
                </div>
                {/* Actions */}
                <div className="p-3.5 space-y-2 bg-[#14121F]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <Heart className="w-5 h-5 text-[#7225E3] fill-[#7225E3]" />
                      <MessageCircle className="w-5 h-5 text-[#6B6780]" />
                      <Share2 className="w-5 h-5 text-[#6B6780]" />
                    </div>
                    <Bookmark className="w-5 h-5 text-[#6B6780]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">1,234 J&apos;aime</p>
                    <p className="text-xs leading-snug text-[#878399]">
                      <span className="font-bold mr-1.5 text-white">creatabl.ia</span>
                      🚀 Rédigez, planifiez et optimisez vos publications avec l&apos;IA de creatabl.ia. Une seule plateforme pour vos réseaux.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. X / TWITTER FORMAT */}
            {activeTab === 'twitter' && (
              <div className="p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex gap-3">
                  <img src="/logo.png" className="w-9 h-9 rounded-full border border-white/10 p-0.5 bg-[#14121F] shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white truncate">creatabl.ia</span>
                      <span className="text-[#6B6780] text-xs truncate">@creatabl_ia · 1m</span>
                    </div>
                    <p className="text-xs text-[#878399] leading-snug mt-1">
                      🚀 Rédigez, planifiez et optimisez vos publications avec l&apos;IA de creatabl.ia. Une seule plateforme pour vos réseaux.
                    </p>
                  </div>
                </div>
                {/* Media */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#14121F] aspect-video">
                  <img src="/post-preview.png" className="w-full h-full object-cover" alt="Twitter preview" />
                </div>
                {/* Actions */}
                <div className="flex items-center justify-between text-[#6B6780] text-xs max-w-[280px] pt-1">
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors"><MessageCircle className="w-4 h-4" /> 12</span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors"><Repeat2 className="w-4 h-4" /> 4</span>
                  <span className="flex items-center gap-1.5 hover:text-[#7225E3] transition-colors"><Heart className="w-4 h-4 text-[#7225E3] fill-[#7225E3]" /> 84</span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors"><BarChart2 className="w-4 h-4" /> 1.2k</span>
                </div>
              </div>
            )}

            {/* 3. LINKEDIN FORMAT */}
            {activeTab === 'linkedin' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-3.5 flex items-center gap-2.5 border-b border-white/5 bg-[#14121F]/20">
                  <img src="/logo.png" className="w-9 h-9 rounded-md border border-white/10 p-0.5 bg-[#14121F] shrink-0" alt="" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      creatabl.ia <span className="text-xs font-medium text-[#7225E3] bg-[#7225E3]/10 px-1.5 py-0.5 rounded">1er</span>
                    </span>
                    <span className="text-xs text-[#6B6780] leading-tight truncate">Social Media Copilot • IA Active</span>
                    <span className="text-xs text-[#4B4B63] leading-tight">À l&apos;instant · 🌐</span>
                  </div>
                </div>
                {/* Text */}
                <p className="px-3.5 py-2.5 text-xs text-[#878399] leading-relaxed">
                  🚀 Rédigez, planifiez et optimisez vos publications avec l&apos;IA de creatabl.ia. Une seule plateforme pour vos réseaux.
                </p>
                {/* Media */}
                <div className="aspect-video bg-[#14121F] overflow-hidden border-y border-white/5">
                  <img src="/post-preview.png" className="w-full h-full object-cover" alt="LinkedIn preview" />
                </div>
                {/* Actions */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1 text-xs text-[#6B6780]">
                    <span>👍 45</span>
                    <span>· 2 commentaires</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[#6B6780] font-bold text-xs">
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Heart className="w-3.5 h-3.5 text-[#7225E3] fill-[#7225E3]" /> J&apos;aime</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> Commenter</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Repeat2 className="w-3.5 h-3.5" /> Reposter</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /> Envoyer</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs xl:text-xs text-[#6B6780] relative z-10 font-medium mt-auto">
          <Shield className="w-4 h-4 text-[#7225E3]" />
          <span>Plateforme sécurisée de niveau entreprise • RGPD Compliant</span>
        </div>
      </div>

      {/* Right Column - Clerk Sign In (Light Theme for perfect readability) */}
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

          {message === 'account_exists' && (
            <div className="w-full mb-6 p-4 rounded-xl bg-[#F3EEFD] border border-[#E7DCFC] text-[#5B1BB8] flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
              <div className="w-5 h-5 rounded-full bg-[#7225E3]/10 border border-[#7225E3]/25 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <span className="text-[#7225E3] text-xs font-semibold">!</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs text-[#5B1BB8]">Compte déjà existant</h4>
                <p className="text-xs text-[#4B4B63] mt-0.5 leading-relaxed">
                  Un compte existe déjà avec cette adresse e-mail. Connectez-vous ci-dessous pour accéder à votre espace.
                </p>
              </div>
            </div>
          )}

          <SignIn
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
                dividerText: "text-[#6B6780] text-xs font-semibold bg-white px-3",
                identityPreviewText: "text-[#14121F]",
                identityPreviewEditButtonIcon: "text-[#7225E3]"
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

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#14121F] text-white">Chargement...</div>}>
      <SignInContent />
    </Suspense>
  )
}
