'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Suspense } from 'react'

export function PublicNavbar() {
  return (
    <Suspense fallback={<nav className="fixed top-0 w-full z-50 h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5" />}>
      <NavbarContent />
    </Suspense>
  )
}

function NavbarContent() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Creatabl<span className="text-indigo-500">.ia</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="/tarifs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tarifs</Link>
          <Link href="/#testimonials" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Témoignages</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="https://app.creatabl-ia.com/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Se connecter</Link>
          <Link 
            href="https://app.creatabl-ia.com/sign-up"
            className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </nav>
  )
}
