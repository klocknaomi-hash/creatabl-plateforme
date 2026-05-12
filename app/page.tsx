'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Zap, BarChart3, Users, Sparkles, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { PublicNavbar } from '@/components/marketing/navbar'
import { Suspense } from 'react'

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>}>
      <LandingContent />
    </Suspense>
  )
}

function LandingContent() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!mounted || !isLoaded || isSignedIn) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest"
          >
            <Zap className="w-3 h-3 fill-indigo-400" />
            Nouveau : L&apos;IA qui comprend votre marque
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]"
          >
            Votre Copilot <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Social Media</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Générez, planifiez et analysez votre contenu sur tous vos réseaux sociaux en un seul endroit. Boosté par l&apos;intelligence artificielle.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link 
              href="https://app.creatabl-ia.com/sign-up?plan=starter"
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Commencer l&apos;essai gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/tarifs"
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Voir les plans
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-16 flex flex-col items-center gap-6"
          >
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center gap-12 grayscale opacity-30 text-white/50">
              <span className="text-2xl font-bold tracking-tighter">BRAND A</span>
              <span className="text-2xl font-bold tracking-tighter">BRAND B</span>
              <span className="text-2xl font-bold tracking-tighter">BRAND C</span>
              <span className="text-2xl font-bold tracking-tighter">BRAND D</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Tout ce dont vous avez besoin</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Une suite d&apos;outils puissants conçus pour maximiser votre impact sur les réseaux sociaux.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
              title="Génération par IA"
              description="Créez des posts captivants en quelques secondes grâce à notre IA entraînée sur les meilleures pratiques."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
              title="Analytics Avancés"
              description="Suivez vos performances avec précision et recevez des recommandations pour optimiser votre croissance."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-400" />}
              title="Gestion d'Équipe"
              description="Collaborez en toute fluidité avec vos collègues ou vos clients. Rôles et permissions personnalisables."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              <span className="text-xl font-bold tracking-tight">Creatabl<span className="text-indigo-500">.ia</span></span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              La plateforme tout-en-un pour les créateurs et les entreprises qui veulent dominer les réseaux sociaux.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest">Produit</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="#features">Fonctionnalités</Link></li>
                <li><Link href="/tarifs">Tarifs</Link></li>
                <li><Link href="#">Nouveautés</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest">Compagnie</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="#">À propos</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Carrières</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest">Légal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="#">Confidentialité</Link></li>
                <li><Link href="#">CGU</Link></li>
                <li><Link href="#">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 flex justify-between items-center text-zinc-600 text-xs font-medium">
          <p>© 2026 Creatabl.ia. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span>Twitter</span>
            <span>LinkedIn</span>
            <span>Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
    </div>
  )
}
