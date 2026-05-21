'use client'

import { useState, useEffect } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { Plus, ChevronDown, Loader2 } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  logoUrl?: string | null
  ownerId: string
  createdAt: string
}

export function WorkspaceSwitcher() {
  const access = useAccess()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [current, setCurrent] = useState<Workspace | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!access.multiAccounts) return

    fetch('/api/workspaces')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkspaces(data)
          if (data.length > 0) {
            const savedId = localStorage.getItem('current_workspace_id')
            const found = data.find(w => w.id === savedId)
            setCurrent(found || data[0])
          }
        }
      })
      .catch(err => console.error("Error fetching workspaces:", err))
      .finally(() => setLoading(false))
  }, [access.multiAccounts])

  if (!access.multiAccounts) return null

  async function createWorkspace() {
    if (!newName.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) {
        const errData = await res.json()
        alert(errData.error || 'Erreur lors de la création')
        return
      }
      const workspace = await res.json()
      setWorkspaces(prev => [...prev, workspace])
      setCurrent(workspace)
      localStorage.setItem('current_workspace_id', workspace.id)
      window.dispatchEvent(new Event('storage'))
      setNewName('')
      setShowCreate(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-3 flex items-center gap-2 text-white/40 text-xs">
        <Loader2 className="size-3 animate-spin" />
        Chargement des espaces...
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-b border-white/5 space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
          Espace de travail
        </p>
      </div>

      <div className="relative">
        <select
          value={current?.id || ''}
          onChange={e => {
            const ws = workspaces.find(w => w.id === e.target.value)
            if (ws) {
              setCurrent(ws)
              localStorage.setItem('current_workspace_id', ws.id)
              window.dispatchEvent(new Event('storage'))
            }
          }}
          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-medium hover:bg-white/10"
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id} className="bg-neutral-900 text-white py-1">
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-white/50">
          <ChevronDown className="size-3.5" />
        </div>
      </div>

      {workspaces.length < 5 && (
        showCreate ? (
          <div className="space-y-2 mt-2 pt-1 border-t border-white/5">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nom du workspace"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') createWorkspace()
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={createWorkspace}
                disabled={submitting}
                className="flex-1 py-1.5 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {submitting ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => {
                  setNewName('')
                  setShowCreate(false)
                }}
                disabled={submitting}
                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs font-medium transition-all cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-transparent border border-dashed border-white/10 hover:border-white/20 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.02] transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            Nouveau workspace
          </button>
        )
      )}

      <div className="flex justify-between items-center text-[10px] text-white/30 pt-0.5">
        <span>{workspaces.length}/5 workspaces utilisés</span>
        {workspaces.length >= 5 && (
          <span className="text-yellow-500/80 font-medium">Limite atteinte</span>
        )}
      </div>
    </div>
  )
}
