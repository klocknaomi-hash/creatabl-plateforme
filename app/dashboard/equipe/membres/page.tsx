'use client'

import { useState, useEffect } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  RefreshCw, 
  Loader2,
  Lock,
  Crown,
  UserCheck,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Member {
  id: string
  userId: string | null
  email: string
  role: string
  status: string
  name: string
  invitedAt: string | null
  joinedAt: string | null
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  editor: 'Éditeur',
  viewer: 'Lecteur',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'Accès complet : Tous les projets et fonctionnalités',
  admin: 'Gestion de l\'équipe : Projets, membres et paramètres',
  editor: 'Créer et modifier : Peut créer et modifier les contenus',
  viewer: 'Lecture seule : Peut voir les projets partagés',
}

export default function MembersPage() {
  const access = useAccess()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Fetch members
  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/team/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      } else {
        toast.error('Impossible de charger les membres de l\'équipe.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du chargement des membres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (access.team) {
      fetchMembers()
    }
  }, [access.team])

  // Open invite modal if query param invite=true
  useEffect(() => {
    if (searchParams.get('invite') === 'true') {
      setInviteModalOpen(true)
      // Clear the query parameter so it doesn't reopen on reload
      router.replace('/dashboard/equipe/membres')
    }
  }, [searchParams, router])

  // Handle invite submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    
    setInviting(true)
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Invitation envoyée à ${inviteEmail} !`)
        setInviteEmail('')
        setInviteModalOpen(false)
        fetchMembers()
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi de l\'invitation.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion.')
    } finally {
      setInviting(false)
    }
  }

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        toast.success('Rôle mis à jour avec succès.')
        // Update local state
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à jour du rôle.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion.')
    }
  }

  // Handle delete member
  const handleDeleteMember = async (memberId: string) => {
    setDeletingId(memberId)
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Membre retiré de l\'équipe.')
        setMembers(members.filter(m => m.id !== memberId))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suppression du membre.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion.')
    } finally {
      setDeletingId(null)
    }
  }

  // Stats calculation
  const totalCount = members.length
  const pendingCount = members.filter(m => m.status === 'pending').length
  const adminCount = members.filter(m => m.role === 'admin' || m.role === 'owner').length
  const editorCount = members.filter(m => m.role === 'editor').length

  // Gate check
  if (!access.team) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full max-w-md border border-border/60 bg-background rounded-2xl shadow-xl p-6 text-center space-y-6">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Gestion d'Équipe ✦ Business
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              La gestion d'équipe est réservée aux abonnés Business.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Invitez vos collaborateurs, attribuez-leur des rôles (Admin, Éditeur, Lecteur) et travaillez ensemble sur vos projets et publications sur les réseaux sociaux.
          </CardContent>
          <CardFooter className="justify-center">
            <Button 
              render={<a href="https://creatabl-ia.com/tarifs" />}
              size="lg" 
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-sm"
            >
              Passer au plan Business →
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Membres de l'équipe
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez les collaborateurs de votre espace de travail et leurs autorisations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchMembers}
            variant="outline"
            className="rounded-xl h-10 text-xs px-3"
            disabled={loading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
          <Button 
            onClick={() => setInviteModalOpen(true)}
            className="rounded-xl font-semibold shadow-sm bg-primary hover:bg-primary/95 text-white text-xs h-10 px-4 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un membre
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-border/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Total Membres</p>
            <h4 className="text-xl font-bold mt-0.5">{loading ? '...' : totalCount}</h4>
          </div>
        </Card>

        <Card className="border border-border/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">En attente</p>
            <h4 className="text-xl font-bold mt-0.5">{loading ? '...' : pendingCount}</h4>
          </div>
        </Card>

        <Card className="border border-border/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Administrateurs</p>
            <h4 className="text-xl font-bold mt-0.5">{loading ? '...' : adminCount}</h4>
          </div>
        </Card>

        <Card className="border border-border/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Éditeurs</p>
            <h4 className="text-xl font-bold mt-0.5">{loading ? '...' : editorCount}</h4>
          </div>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="border border-border/60 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Chargement de la liste des membres...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5">
            <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-sm font-bold text-foreground">Aucun membre dans l'équipe</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
              Invitez des collaborateurs pour commencer à collaborer sur vos publications.
            </p>
            <Button 
              onClick={() => setInviteModalOpen(true)}
              className="rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs h-9 px-4 shadow-sm"
            >
              Inviter un membre
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/15 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nom / Email</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Rôle & Accès</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/5 transition-colors text-sm">
                    {/* Name / Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{member.name || member.email.split('@')[0]}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-muted-foreground/60" />
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {member.status === 'pending' ? (
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 text-[10px] font-bold">
                          Invitation envoyée
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 text-[10px] font-bold">
                          Actif
                        </Badge>
                      )}
                    </td>

                    {/* Role Selector & Description */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-[280px]">
                        {member.role === 'owner' ? (
                          <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            {ROLE_LABELS.owner}
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="bg-transparent border-none text-foreground font-semibold text-xs focus:ring-0 outline-none cursor-pointer p-0 -ml-0.5"
                          >
                            <option value="admin">Administrateur</option>
                            <option value="editor">Éditeur</option>
                            <option value="viewer">Lecteur</option>
                          </select>
                        )}
                        <span className="text-xs text-muted-foreground/80 leading-relaxed">
                          {ROLE_DESCRIPTIONS[member.role] || ''}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <Button
                          onClick={() => handleDeleteMember(member.id)}
                          disabled={deletingId === member.id}
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          {deletingId === member.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6 border border-border/80 shadow-2xl bg-background">
          <form onSubmit={handleInviteSubmit} className="space-y-5">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Inviter un collaborateur
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Envoyez une invitation par e-mail pour rejoindre votre espace de travail Creatabl.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email" className="text-xs font-bold text-foreground/75">Adresse e-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="nom@entreprise.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-role" className="text-xs font-bold text-foreground/75">Rôle du membre</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus-visible:ring-1 focus-visible:ring-primary shadow-sm outline-none cursor-pointer"
                >
                  <option value="admin">Administrateur (Gestion équipe & projets)</option>
                  <option value="editor">Éditeur (Créer et modifier les contenus)</option>
                  <option value="viewer">Lecteur (Lecture seule)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setInviteModalOpen(false)} 
                className="rounded-xl text-xs font-semibold h-9"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={inviting}
                size="sm" 
                className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/95 text-white h-9 shadow-sm flex items-center gap-1.5"
              >
                {inviting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    Envoyer l'invitation
                    <Send className="w-3 h-3" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
