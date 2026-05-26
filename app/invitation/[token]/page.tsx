'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Users, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface InvitationData {
  valid: boolean
  email?: string
  role?: string
  workspaceName?: string
  error?: string
}

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const token = resolvedParams.token

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<InvitationData | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    async function checkInvitation() {
      try {
        const res = await fetch(`/api/team/invitations/${token}`)
        const resData = await res.json()
        setData(resData)
      } catch (err) {
        console.error('Error checking invitation:', err)
        setData({ valid: false, error: 'Une erreur est survenue lors de la vérification.' })
      } finally {
        setLoading(false)
      }
    }
    checkInvitation()
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    try {
      const res = await fetch(`/api/team/invitations/${token}`, {
        method: 'POST',
      })
      const resData = await res.json()
      if (res.ok && resData.success) {
        setAccepted(true)
        toast.success("Invitation acceptée avec succès !")
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        toast.error(resData.error || "Impossible d'accepter l'invitation.")
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      toast.error("Erreur de connexion.")
    } finally {
      setAccepting(false)
    }
  }

  const roleLabels: Record<string, string> = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Lecteur',
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {loading ? (
          <Card className="border border-border/40 bg-slate-900/50 backdrop-blur-xl text-center p-8">
            <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Vérification de votre invitation...</p>
            </CardContent>
          </Card>
        ) : data && data.valid ? (
          <Card className="border border-border/40 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header Gradient */}
            <div className="h-2 bg-gradient-to-r from-primary to-indigo-500" />
            <CardHeader className="text-center space-y-3 pt-8">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-white tracking-tight">
                Invitation d'équipe
              </CardTitle>
              <CardDescription className="text-sm text-slate-400">
                Vous avez été invité à rejoindre un espace de travail sur Creatabl
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6">
              <div className="bg-slate-950/60 border border-border/20 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Espace de travail :</span>
                  <span className="font-semibold text-white">{data.workspaceName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Rôle proposé :</span>
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    {roleLabels[data.role || ''] || data.role}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pour :</span>
                  <span className="font-semibold text-slate-300">{data.email}</span>
                </div>
              </div>

              {accepted ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-4 text-emerald-400">
                  <CheckCircle2 className="w-12 h-12" />
                  <p className="text-sm font-semibold">Invitation acceptée ! Redirection...</p>
                </div>
              ) : (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-11 shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Rejoindre l'équipe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
            <CardFooter className="justify-center pb-8">
              <p className="text-[11px] text-slate-500 text-center">
                En acceptant cette invitation, vous acceptez les conditions de service de Creatabl.ia
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border border-border/40 bg-slate-900/50 backdrop-blur-xl text-center shadow-2xl p-8">
            <CardHeader className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Invitation invalide</CardTitle>
              <CardDescription className="text-sm text-slate-400">
                {data?.error || "Cette invitation est invalide, a expiré ou a déjà été utilisée."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full rounded-xl text-xs h-10 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
