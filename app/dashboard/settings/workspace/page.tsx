'use client'

import { useState, useEffect } from 'react'
import { useAccess } from '@/hooks/useAccess'
import {
  Building2,
  Plus,
  Check,
  Loader2,
  Trash2,
  Pencil,
  X,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Workspace {
  id: string
  name: string
  logoUrl?: string | null
  ownerId: string
  createdAt: string
}

export default function WorkspacePage() {
  const access = useAccess()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces')
      if (res.ok) {
        const data: Workspace[] = await res.json()
        setWorkspaces(data)
        const savedId = localStorage.getItem('current_workspace_id')
        const found = data.find(w => w.id === savedId)
        setCurrentId(found?.id || data[0]?.id || null)
        // Sync current workspace name to localStorage for the sidebar chip
        const active = found || data[0]
        if (active) {
          localStorage.setItem('current_workspace_name', active.name)
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const handleSelect = (ws: Workspace) => {
    setCurrentId(ws.id)
    localStorage.setItem('current_workspace_id', ws.id)
    localStorage.setItem('current_workspace_name', ws.name)
    window.dispatchEvent(new Event('storage'))
    toast.success(`Workspace "${ws.name}" sélectionné`)
  }

  const handleCreate = async () => {
    if (!newName.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de la création')
        return
      }
      const ws: Workspace = await res.json()
      setWorkspaces(prev => [...prev, ws])
      handleSelect(ws)
      setNewName('')
      setShowCreate(false)
      toast.success(`Workspace "${ws.name}" créé avec succès`)
    } catch (err) {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  if (!access.multiAccounts) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Espaces de travail</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos espaces de travail et basculez entre eux.
          </p>
        </header>
        <Card className="border-dashed border-primary/20 bg-primary/5 rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="size-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold">Fonctionnalité Business</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Les espaces de travail multiples sont disponibles avec le plan Business.
                Passez au niveau supérieur pour collaborer avec votre équipe.
              </p>
            </div>
            <Button
              render={<a href="https://creatabl-ia.com/tarifs" />}
              className="rounded-full px-6"
            >
              Découvrir le plan Business
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    )
  }

  const canCreate = workspaces.length < 5

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Espaces de travail</h1>
          <p className="text-sm text-muted-foreground">
            Gérez et basculez entre vos espaces de travail.
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="gap-2 rounded-xl"
          >
            <Plus className="size-4" />
            Nouveau workspace
          </Button>
        )}
      </div>

      {/* Quota indicator */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              workspaces.length >= 5 ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${(workspaces.length / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold shrink-0">
          {workspaces.length}/5 workspace{workspaces.length > 1 ? 's' : ''}
        </span>
        {workspaces.length >= 5 && (
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 rounded-full">
            Limite atteinte
          </Badge>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold">Nom du nouveau workspace</p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') { setShowCreate(false); setNewName('') }
                }}
                placeholder="Ex: Marque secondaire, Client X…"
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <Button size="sm" onClick={handleCreate} disabled={submitting} className="rounded-xl gap-1.5 shrink-0">
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Créer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl shrink-0"
                onClick={() => { setShowCreate(false); setNewName('') }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspace list */}
      <div className="space-y-3">
        {workspaces.map(ws => {
          const isActive = ws.id === currentId
          const isEditing = editingId === ws.id
          const initials = ws.name.slice(0, 2).toUpperCase()

          return (
            <Card
              key={ws.id}
              className={cn(
                'rounded-2xl border transition-all cursor-pointer group hover:shadow-md',
                isActive
                  ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border/60 hover:border-primary/20'
              )}
              onClick={() => !isEditing && handleSelect(ws)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className={cn(
                  'size-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}>
                  {initials}
                </div>

                {/* Name / Edit */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        e.stopPropagation()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full bg-background border border-primary/40 rounded-lg px-2.5 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  ) : (
                    <div>
                      <p className="font-semibold text-sm truncate">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Créé le{' '}
                        {new Date(ws.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Active badge */}
                {isActive && !isEditing && (
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Actif
                  </Badge>
                )}

                {/* Check icon */}
                {isActive && (
                  <div className="size-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="size-3.5 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info box */}
      <div className="rounded-2xl bg-muted/40 border border-border/50 p-4 flex items-start gap-3">
        <AlertCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Chaque espace de travail dispose de ses propres comptes connectés, posts et analytiques.
          Vous pouvez créer jusqu'à <strong>5 workspaces</strong> avec le plan Business.
        </p>
      </div>
    </div>
  )
}
