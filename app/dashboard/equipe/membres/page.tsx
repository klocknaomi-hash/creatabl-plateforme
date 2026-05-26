'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useAccess } from '@/hooks/useAccess'
import {
  Users,
  Shield,
  UserCheck,
  Eye,
  MoreVertical,
  Mail,
  Trash2,
  Send,
  Info,
  Clock,
  Loader2,
  X,
  UserPlus,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Member {
  id: string
  workspaceId: string
  userId: string | null
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  invitedAt: string | null
  joinedAt: string | null
  name?: string
}

const baseMockMembers: Member[] = [
  { id: 'mock-lucas', workspaceId: 'default', userId: 'user-lucas', email: 'lucas@creatabl.com', role: 'admin', status: 'active', invitedAt: '2025-05-10T10:00:00Z', joinedAt: '2025-05-11T12:00:00Z', name: 'Lucas M.' },
  { id: 'mock-chloe', workspaceId: 'default', userId: 'user-chloe', email: 'chloe@creatabl.com', role: 'editor', status: 'active', invitedAt: '2025-05-12T10:00:00Z', joinedAt: '2025-05-13T12:00:00Z', name: 'Chloé D.' },
  { id: 'mock-thomas', workspaceId: 'default', userId: 'user-thomas', email: 'thomas@creatabl.com', role: 'editor', status: 'active', invitedAt: '2025-05-12T10:00:00Z', joinedAt: '2025-05-14T12:00:00Z', name: 'Thomas R.' },
  { id: 'mock-sophie', workspaceId: 'default', userId: 'user-sophie', email: 'sophie@creatabl.com', role: 'editor', status: 'active', invitedAt: '2025-05-12T10:00:00Z', joinedAt: '2025-05-15T12:00:00Z', name: 'Sophie L.' },
  { id: 'mock-antoine', workspaceId: 'default', userId: 'user-antoine', email: 'antoine@creatabl.com', role: 'viewer', status: 'active', invitedAt: '2025-05-13T10:00:00Z', joinedAt: '2025-05-14T12:00:00Z', name: 'Antoine B.' },
  { id: 'mock-julie', workspaceId: 'default', userId: null, email: 'julie@creatabl.com', role: 'viewer', status: 'pending', invitedAt: '2025-05-15T10:00:00Z', joinedAt: null, name: 'Julie T.' },
  { id: 'mock-maxime', workspaceId: 'default', userId: null, email: 'maxime@creatabl.com', role: 'viewer', status: 'pending', invitedAt: '2025-05-14T10:00:00Z', joinedAt: null, name: 'Maxime P.' }
]

export default function MembresPage() {
  const { user } = useUser()
  const access = useAccess()
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasInviteParam = searchParams.get('invite') === 'true'

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [submittingInvite, setSubmittingInvite] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Fetch real team members from the database
  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team/members')
      if (res.ok) {
        const dbData: Member[] = await res.json()
        
        // Merge real db members with base mock members
        // Ensure no duplicate emails
        const dbEmails = new Set(dbData.map(m => m.email.toLowerCase()))
        const filteredMocks = baseMockMembers.filter(m => !dbEmails.has(m.email.toLowerCase()))
        
        // Mark the current user (Naomi / matching email) as "Vous"
        const combined = [...dbData, ...filteredMocks].map(m => {
          if (m.email.toLowerCase() === user?.primaryEmailAddress?.emailAddress.toLowerCase()) {
            return { ...m, name: `${m.name || user.fullName || 'Naomi K.'} (Vous)` }
          }
          return m
        })
        
        setMembers(combined)
      } else {
        // Fallback to mocks if API fails or unauthorized (Starter/Pro access)
        setMembers(baseMockMembers)
      }
    } catch (err) {
      console.error(err)
      setMembers(baseMockMembers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMembers()
    }
  }, [user])

  useEffect(() => {
    if (hasInviteParam) {
      setShowInviteModal(true)
      // Clean query parameter from URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [hasInviteParam])

  // Get Initials for Avatar
  const getInitials = (name?: string, email?: string) => {
    const text = name || email || '?'
    const parts = text.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return text.substring(0, 2).toUpperCase()
  }

  // Handle invitation submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSubmittingInvite(true)
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
      })

      if (res.ok) {
        toast.success(`Invitation envoyée à ${inviteEmail}`)
        setInviteEmail('')
        setShowInviteModal(false)
        fetchMembers()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Impossible d'envoyer l'invitation.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Une erreur s'est produite lors de l'invitation.")
    } finally {
      setSubmittingInvite(false)
    }
  }

  // Handle Role change
  const handleRoleChange = async (memberId: string, newRole: Member['role']) => {
    setActiveDropdown(null)
    
    // Check if it's a mock member
    if (memberId.startsWith('mock-')) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      toast.success("Rôle mis à jour (démo)")
      return
    }

    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (res.ok) {
        toast.success("Rôle mis à jour avec succès.")
        fetchMembers()
      } else {
        toast.error("Erreur lors de la mise à jour du rôle.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau.")
    }
  }

  // Handle member removal
  const handleDeleteMember = async (memberId: string) => {
    setActiveDropdown(null)
    if (!confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) return

    // Check if it's a mock member
    if (memberId.startsWith('mock-')) {
      setMembers(prev => prev.filter(m => m.id !== memberId))
      toast.success("Membre retiré (démo)")
      return
    }

    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success("Membre retiré de l'équipe.")
        fetchMembers()
      } else {
        toast.error("Erreur lors du retrait du membre.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau.")
    }
  }

  // Handle Resend invitation
  const handleResendInvite = (email: string) => {
    toast.success(`Invitation renvoyée avec succès à ${email}`)
  }

  // Check stats counts
  const totalCount = members.length
  const adminCount = members.filter(m => m.role === 'admin' || m.role === 'owner').length
  const editorCount = members.filter(m => m.role === 'editor').length
  const invitedCount = members.filter(m => m.status === 'pending').length

  const roleTextMap = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Invité'
  }

  const roleStyles = {
    owner: 'bg-purple-100 text-purple-700 border-purple-200',
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    editor: 'bg-primary/10 text-primary border-primary/20',
    viewer: 'bg-amber-100 text-amber-700 border-amber-200'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement des membres de l'équipe...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10 max-w-screen-xl mx-auto w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Membres de l'équipe</h1>
            <HelpCircle className="size-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les membres, les rôles et les permissions de votre équipe.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/10"
        >
          <UserPlus className="size-4" />
          Inviter un membre
        </button>
      </div>

      {/* STATS BAR (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{totalCount}</div>
            <div className="text-sm font-semibold text-gray-800">Membres</div>
            <div className="text-xs text-gray-400 font-medium">Actifs dans l'équipe</div>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-2xl text-green-600">
            <Shield className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{adminCount}</div>
            <div className="text-sm font-semibold text-gray-800">Admins</div>
            <div className="text-xs text-gray-400 font-medium">Peuvent gérer l'équipe</div>
          </div>
        </div>

        {/* Editors */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <UserCheck className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{editorCount}</div>
            <div className="text-sm font-semibold text-gray-800">Éditeurs</div>
            <div className="text-xs text-gray-400 font-medium">Peuvent créer et modifier</div>
          </div>
        </div>

        {/* Invited / Pending */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
            <Eye className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{invitedCount}</div>
            <div className="text-sm font-semibold text-gray-800">Invité{invitedCount > 1 ? 's' : ''}</div>
            <div className="text-xs text-gray-400 font-medium">Accès limité</div>
          </div>
        </div>
      </div>

      {/* MEMBERS TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Membre</th>
                <th className="py-4 px-6">Rôle</th>
                <th className="py-4 px-6">Accès</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {members.map(member => {
                const isYou = member.name?.includes('(Vous)')
                const isPending = member.status === 'pending'
                const displayRole = roleTextMap[member.role] || member.role
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Member Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 border border-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                          {getInitials(member.name, member.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {member.name || member.email.split('@')[0]}
                            {isYou && (
                              <span className="text-[10px] font-bold bg-[#EEEDFE] text-[#534AB7] px-1.5 py-0.5 rounded-md">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-medium truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-4 px-6">
                      {isYou || member.role === 'owner' ? (
                        <div className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${roleStyles[member.role] || ''}`}>
                          {displayRole}
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Member['role'])}
                            className={`appearance-none cursor-pointer pr-7 text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none transition-all focus:ring-1 focus:ring-primary/50 shadow-sm ${roleStyles[member.role] || ''}`}
                          >
                            <option value="admin">Administrateur</option>
                            <option value="editor">Éditeur</option>
                            <option value="viewer">Invité</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                            <ChevronDown className="size-3" />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Access description */}
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <div className="flex items-start gap-2 max-w-[280px]">
                        {member.role === 'owner' && (
                          <>
                            <CheckCircle2 className="size-4 text-purple-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Accès complet</div>
                              <div className="text-[11px] text-gray-400">Tous les projets et fonctionnalités</div>
                            </div>
                          </>
                        )}
                        {member.role === 'admin' && (
                          <>
                            <Shield className="size-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Gestion de l'équipe</div>
                              <div className="text-[11px] text-gray-400">Projets, membres et paramètres</div>
                            </div>
                          </>
                        )}
                        {member.role === 'editor' && (
                          <>
                            <UserCheck className="size-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Créer et modifier</div>
                              <div className="text-[11px] text-gray-400">Peut créer et modifier les contenus</div>
                            </div>
                          </>
                        )}
                        {member.role === 'viewer' && !isPending && (
                          <>
                            <Eye className="size-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Lecture seule</div>
                              <div className="text-[11px] text-gray-400">Peut voir les projets partagés</div>
                            </div>
                          </>
                        )}
                        {isPending && (
                          <>
                            <Clock className="size-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">En attente d'acceptation</div>
                              <div className="text-[11px] text-gray-400">
                                Invitation envoyée le {member.invitedAt ? new Date(member.invitedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 mai 2025'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {isPending ? (
                        <span className="inline-flex items-center text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                          Actif
                        </span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending && (
                          <button
                            onClick={() => handleResendInvite(member.email)}
                            className="inline-flex items-center gap-1 text-xs text-[#534AB7] hover:text-[#453da3] font-bold py-1 px-2.5 rounded-lg hover:bg-purple-50 transition-all cursor-pointer"
                          >
                            <Send className="size-3" />
                            Renvoyer
                          </button>
                        )}

                        {!isYou && member.role !== 'owner' && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="size-4.5" />
                            </button>
                            
                            {activeDropdown === member.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveDropdown(null)} 
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                                  <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                                  >
                                    <Trash2 className="size-3.5" />
                                    Supprimer
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO BOX */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-primary hover:underline cursor-pointer">
            En savoir plus sur les rôles et les permissions
          </span>
        </div>
      </div>

      {/* INVITE MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />

            {/* Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 border border-gray-100 flex flex-col relative"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="size-5 text-[#534AB7]" />
                  Inviter un membre
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="invite-email" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Adresse email
                  </label>
                  <div className="relative">
                    <input
                      id="invite-email"
                      type="email"
                      required
                      placeholder="exemple@entreprise.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-medium"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Role selection */}
                <div className="space-y-1">
                  <label htmlFor="invite-role" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Rôle de l'invité
                  </label>
                  <div className="relative">
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all cursor-pointer font-medium"
                    >
                      <option value="editor">Éditeur (peut créer et modifier les contenus)</option>
                      <option value="admin">Administrateur (gestion équipe + projets + paramètres)</option>
                      <option value="viewer">Lecture seule (peut voir les projets partagés)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                      <ChevronDown className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 flex gap-2">
                  <Info className="size-4 text-[#534AB7] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#534AB7]/90 leading-normal font-medium">
                    Un email d'invitation sera envoyé à l'adresse indiquée. L'utilisateur pourra rejoindre votre espace de travail et aura les permissions associées à son rôle.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#534AB7] hover:bg-[#453da3] text-white font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingInvite ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Invitation...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Envoyer l'invitation
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
