'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Suspense } from 'react'

export function PublicNavbar() {
  return (
    <Suspense fallback={<nav className="fixed top-0 w-full z-50 h-20 bg-[#14121F]/80 backdrop-blur-xl border-b border-white/5" />}>
      <NavbarContent />
    </Suspense>
  )
}

function NavbarContent() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#14121F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#7225E3] rounded-xl flex items-center justify-center shadow-lg shadow-[#7225E3]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Creatabl<span className="text-[#7225E3]">.ia</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/#features" className="text-sm font-medium text-[#6B6780] hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="https://creatabl-ia.com/tarifs" className="text-sm font-medium text-[#6B6780] hover:text-white transition-colors">Tarifs</Link>
          <Link href="/#testimonials" className="text-sm font-medium text-[#6B6780] hover:text-white transition-colors">Témoignages</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="https://app.creatabl-ia.com/sign-in" className="text-sm font-medium text-[#6B6780] hover:text-white transition-colors">Se connecter</Link>
          <Link 
            href="https://app.creatabl-ia.com/sign-up"
            className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#E8E6F0] transition-all active:scale-95"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </nav>
  )
}
