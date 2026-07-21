'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser, useOrganization } from '@clerk/nextjs'
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
  ChevronDown,
  Bell,
  Crown,
  PenLine
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { NotificationsPopover } from '@/components/dashboard/notifications-popover'

interface MemberRow {
  id: string
  userId: string | null
  email: string
  name: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  invitedAt?: string | null
  joinedAt?: string | null
  avatarUrl?: string
  clerkMembership?: any
  clerkInvitation?: any
}

export default function MembresPage() {
  const { user } = useUser()
  const { organization, memberships, invitations, isLoaded } = useOrganization({
    memberships: {
      pageSize: 50,
    },
    invitations: {
      pageSize: 50,
    },
  })

  const access = useAccess()
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasInviteParam = searchParams.get('invite') === 'true'

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [submittingInvite, setSubmittingInvite] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null)

  // Derive real active members from Clerk
  const activeMembers: MemberRow[] = useMemo(() => {
    if (memberships?.data && memberships.data.length > 0) {
      return memberships.data.map((m) => {
        const userData = m.publicUserData
        const firstName = userData?.firstName || ''
        const lastName = userData?.lastName || ''
        const identifier = userData?.identifier || ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        const name = fullName || (identifier ? identifier.split('@')[0] : 'Membre')
        const email = identifier || ''
        const isOwner = m.role === 'org:admin'
        const isYou = userData?.userId === user?.id || (email && email.toLowerCase() === user?.primaryEmailAddress?.emailAddress.toLowerCase())

        return {
          id: m.id,
          userId: userData?.userId || m.id,
          email: email || user?.primaryEmailAddress?.emailAddress || '',
          name: isYou ? `${name} (Vous)` : name,
          role: (isOwner ? 'owner' : 'editor') as 'owner' | 'admin' | 'editor' | 'viewer',
          status: 'active' as const,
          avatarUrl: userData?.imageUrl || '',
          joinedAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
          clerkMembership: m,
        }
      })
    }

    if (user) {
      const name = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Moi'
      return [{
        id: user.id,
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: `${name} (Vous)`,
        role: 'owner' as const,
        status: 'active' as const,
        avatarUrl: user.imageUrl || '',
        joinedAt: new Date().toISOString(),
        clerkMembership: null,
      }]
    }

    return []
  }, [memberships, user])

  // Derive pending invitations from Clerk
  const pendingInvitations: MemberRow[] = useMemo(() => {
    if (invitations?.data && invitations.data.length > 0) {
      return invitations.data.map((inv) => {
        return {
          id: inv.id,
          userId: null,
          email: inv.emailAddress,
          name: inv.emailAddress.split('@')[0],
          role: (inv.role === 'org:admin' ? 'admin' : 'editor') as 'owner' | 'admin' | 'editor' | 'viewer',
          status: 'pending' as const,
          invitedAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : null,
          joinedAt: null,
          avatarUrl: '',
          clerkInvitation: inv,
        }
      })
    }
    return []
  }, [invitations])

  const allMembers = useMemo(() => {
    return [...activeMembers, ...pendingInvitations]
  }, [activeMembers, pendingInvitations])

  useEffect(() => {
    if (hasInviteParam) {
      setShowInviteModal(true)
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

  // Handle invitation submission with Clerk SDK
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSubmittingInvite(true)
    try {
      if (organization) {
        await organization.inviteMember({
          emailAddress: inviteEmail.trim(),
          role: inviteRole === 'admin' ? 'org:admin' : 'org:member',
        })
        toast.success(`Invitation envoyée avec succès à ${inviteEmail}`)
        setInviteEmail('')
        setShowInviteModal(false)
        await Promise.all([
          memberships?.revalidate?.(),
          invitations?.revalidate?.()
        ])
      } else {
        toast.error("Aucune organisation active sélectionnée.")
      }
    } catch (err: any) {
      console.error("Clerk invite member error:", err)
      const msg = err.errors?.[0]?.longMessage || err.message || "Erreur lors de l'envoi de l'invitation."
      toast.error(msg)
    } finally {
      setSubmittingInvite(false)
    }
  }

  // Handle Role change via Clerk
  const handleRoleChange = async (memberItem: MemberRow, newRole: MemberRow['role']) => {
    setActiveRoleDropdown(null)
    if (memberItem.clerkMembership) {
      try {
        await memberItem.clerkMembership.update({
          role: newRole === 'admin' || newRole === 'owner' ? 'org:admin' : 'org:member',
        })
        toast.success("Rôle mis à jour avec succès.")
        memberships?.revalidate?.()
      } catch (err: any) {
        console.error(err)
        toast.error("Erreur lors de la mise à jour du rôle.")
      }
    }
  }

  // Handle member removal or invitation revocation
  const handleDeleteMember = async (memberItem: MemberRow) => {
    setActiveDropdown(null)
    if (memberItem.clerkInvitation) {
      if (!confirm(`Voulez-vous vraiment annuler l'invitation de ${memberItem.email} ?`)) return
      try {
        await memberItem.clerkInvitation.revoke()
        toast.success("Invitation annulée.")
        invitations?.revalidate?.()
      } catch (err: any) {
        console.error(err)
        toast.error("Erreur lors de l'annulation de l'invitation.")
      }
    } else if (memberItem.clerkMembership && memberItem.userId) {
      if (!confirm(`Voulez-vous vraiment retirer ${memberItem.name} de l'organisation ?`)) return
      try {
        await organization?.removeMember(memberItem.userId)
        toast.success("Membre retiré de l'équipe.")
        memberships?.revalidate?.()
      } catch (err: any) {
        console.error(err)
        toast.error("Erreur lors du retrait du membre.")
      }
    }
  }

  // Resend invitation
  const handleResendInvite = async (memberItem: MemberRow) => {
    if (memberItem.email && organization) {
      try {
        await organization.inviteMember({
          emailAddress: memberItem.email,
          role: memberItem.role === 'admin' ? 'org:admin' : 'org:member',
        })
        toast.success(`Invitation renvoyée à ${memberItem.email}`)
        invitations?.revalidate?.()
      } catch (err: any) {
        toast.error("Erreur lors du renvoi de l'invitation.")
      }
    }
  }

  // Calculated Stat Counts
  const totalCount = allMembers.length
  const adminCount = activeMembers.filter(m => m.role === 'admin' || m.role === 'owner').length
  const editorCount = activeMembers.filter(m => m.role === 'editor' || m.role === 'viewer').length
  const invitedCount = pendingInvitations.length

  const roleTextMap = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Invité'
  }

  const roleStyles = {
    owner: 'bg-purple-50 text-purple-700 border-purple-100',
    admin: 'bg-blue-50 text-blue-700 border-blue-100',
    editor: 'bg-[#534AB7]/5 text-[#534AB7] border-[#534AB7]/10',
    viewer: 'bg-amber-50 text-amber-700 border-amber-100'
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-[#7C3AED] animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement des membres de l'équipe...</p>
      </div>
    )
  }

  if (allMembers.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 my-6 shadow-sm max-w-2xl mx-auto">
        <div className="size-16 rounded-full bg-[#7F77DD]/10 text-[#7F77DD] flex items-center justify-center mx-auto mb-2">
          <Users className="size-8 text-[#7F77DD]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111827]">Aucun membre dans votre équipe</h2>
        <p className="text-[#6B7280] text-sm max-w-sm mx-auto leading-relaxed">
          Invitez votre premier membre pour commencer à collaborer.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 bg-[#7F77DD] hover:bg-[#6C63D6] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-[#7F77DD]/20 cursor-pointer"
          >
            + Inviter un membre
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10 max-w-screen-xl mx-auto w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Membres de l'équipe</h1>
            <Info className="size-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors mt-0.5" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les membres, les rôles et les invitations de votre organisation.
          </p>
        </div>
        
        <div className="flex items-center gap-3.5 self-end sm:self-auto">
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-[#534AB7]/5 text-[#534AB7] border border-[#534AB7]/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
          >
            <UserPlus className="size-4 text-[#534AB7]" />
            Inviter un membre
          </button>
          
          {/* Notifications Bell */}
          <NotificationsPopover className="rounded-full border border-gray-100 bg-white hover:bg-gray-50 size-9.5 flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-none font-normal shrink-0" />
          
          {/* Connected User Avatar */}
          {user?.imageUrl && (
            <img 
              src={user.imageUrl} 
              alt={user.fullName || "User"}
              className="size-9.5 rounded-full border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-all"
              onClick={() => toast.info(`Connecté en tant que ${user.fullName || user.firstName}`)}
            />
          )}
        </div>
      </div>

      {/* STATS BAR (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-white border border-gray-100/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-full flex items-center justify-center bg-[#534AB7]/10 text-[#534AB7] shrink-0">
            <Users className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 leading-none">{totalCount}</span>
              <span className="text-sm font-semibold text-gray-800 leading-none">Membres</span>
            </div>
            <span className="text-[11px] text-gray-450 font-medium mt-1 leading-none">Dans l'organisation</span>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white border border-gray-100/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-full flex items-center justify-center bg-[#E6F4EA] text-[#137333] shrink-0">
            <Shield className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 leading-none">{adminCount}</span>
              <span className="text-sm font-semibold text-gray-800 leading-none">Admins</span>
            </div>
            <span className="text-[11px] text-gray-450 font-medium mt-1 leading-none">Gestion complète</span>
          </div>
        </div>

        {/* Editors */}
        <div className="bg-white border border-gray-100/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-full flex items-center justify-center bg-[#E8F0FE] text-[#1A73E8] shrink-0">
            <UserCheck className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 leading-none">{editorCount}</span>
              <span className="text-sm font-semibold text-gray-800 leading-none">Éditeurs</span>
            </div>
            <span className="text-[11px] text-gray-450 font-medium mt-1 leading-none">Création & Édition</span>
          </div>
        </div>

        {/* Invited / Pending */}
        <div className="bg-white border border-gray-100/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-full flex items-center justify-center bg-[#FEF7E0] text-[#B06000] shrink-0">
            <Eye className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 leading-none">{invitedCount}</span>
              <span className="text-sm font-semibold text-gray-800 leading-none">En attente</span>
            </div>
            <span className="text-[11px] text-gray-450 font-medium mt-1 leading-none">Invitations envoyées</span>
          </div>
        </div>
      </div>

      {/* SINGLE MEMBER CALLOUT */}
      {allMembers.length === 1 && (
        <div className="bg-gradient-to-r from-[#7C3AED]/10 via-[#7C3AED]/5 to-transparent border border-[#7C3AED]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Crown className="size-4 text-[#7C3AED]" />
              Vous êtes actuellement le seul membre de cette organisation
            </h3>
            <p className="text-xs text-gray-500 max-w-lg">
              Invitez vos collaborateurs pour commencer à créer des contenus et gérer vos projets en équipe.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
          >
            <UserPlus className="size-4" />
            Inviter votre équipe
          </button>
        </div>
      )}

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
              {allMembers.map(member => {
                const isYou = member.userId === user?.id || member.name.includes('(Vous)')
                const isPending = member.status === 'pending'
                const displayRole = roleTextMap[member.role] || member.role
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Member Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {member.avatarUrl ? (
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name || ''} 
                            className="size-10 rounded-full border border-gray-100 object-cover shrink-0" 
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/10 text-[#534AB7] font-bold flex items-center justify-center text-sm shrink-0">
                            {getInitials(member.name, member.email)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {member.name}
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
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => {
                            if (isYou && member.role === 'owner') {
                              toast.error("Vous ne pouvez pas modifier votre propre rôle de propriétaire.");
                              return;
                            }
                            if (isPending) return;
                            setActiveRoleDropdown(activeRoleDropdown === member.id ? null : member.id);
                          }}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer ${
                            roleStyles[member.role] || ''
                          }`}
                        >
                          <span>{displayRole}</span>
                          {!isPending && !isYou && <ChevronDown className="size-3 opacity-60" />}
                        </button>
                        
                        {activeRoleDropdown === member.id && !isPending && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setActiveRoleDropdown(null)} 
                            />
                            <div className="absolute left-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Rôle
                              </div>
                              <button
                                onClick={() => handleRoleChange(member, 'admin')}
                                className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${
                                  member.role === 'admin' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span>Administrateur</span>
                                {member.role === 'admin' && <span className="size-1.5 bg-blue-600 rounded-full" />}
                              </button>
                              <button
                                onClick={() => handleRoleChange(member, 'editor')}
                                className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${
                                  member.role === 'editor' ? 'text-[#534AB7] bg-purple-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span>Éditeur</span>
                                {member.role === 'editor' && <span className="size-1.5 bg-[#534AB7] rounded-full" />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Access description */}
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <div className="flex items-start gap-2 max-w-[280px]">
                        {member.role === 'owner' && (
                          <>
                            <Crown className="size-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Accès complet</div>
                              <div className="text-[11px] text-gray-400">Propriétaire de l'organisation</div>
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
                        {member.role === 'editor' && !isPending && (
                          <>
                            <PenLine className="size-4 text-gray-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">Créer et modifier</div>
                              <div className="text-[11px] text-gray-400">Peut créer et modifier les contenus</div>
                            </div>
                          </>
                        )}
                        {isPending && (
                          <>
                            <Clock className="size-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-800 text-xs">En attente d'acceptation</div>
                              <div className="text-[11px] text-gray-400">
                                Invitation envoyée le {member.invitedAt ? new Date(member.invitedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Récemment'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {isPending ? (
                        <span className="inline-flex items-center text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full">
                          En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full">
                          Actif
                        </span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {isPending && (
                          <button
                            onClick={() => handleResendInvite(member)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#534AB7] hover:text-[#453da3] font-bold py-1.5 px-3 rounded-xl hover:bg-[#534AB7]/5 border border-transparent hover:border-[#534AB7]/10 transition-all cursor-pointer shadow-sm bg-white"
                          >
                            <Send className="size-3 text-[#534AB7]" />
                            Renvoyer
                          </button>
                        )}

                        {!isYou && member.role !== 'owner' && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                              className="p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer bg-white"
                            >
                              <MoreVertical className="size-4.5" />
                            </button>
                            
                            {activeDropdown === member.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={() => setActiveDropdown(null)} 
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-40">
                                  <button
                                    onClick={() => handleDeleteMember(member)}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                                  >
                                    <Trash2 className="size-3.5 text-red-550" />
                                    {isPending ? 'Annuler' : 'Supprimer'}
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
      <div className="bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#534AB7]/10 transition-colors">
        <Info className="size-4 text-[#534AB7] shrink-0" />
        <span className="text-xs font-semibold text-[#534AB7]">
          Les membres et invitations sont directement gérés par Clerk Organizations.
        </span>
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
                    Un email d'invitation Clerk sera envoyé à l'adresse indiquée pour rejoindre votre organisation.
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
