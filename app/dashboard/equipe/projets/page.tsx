'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  FolderKanban,
  Users,
  MessageSquare,
  MoreVertical,
  Plus,
  Calendar,
  Layers,
  Search,
  ChevronDown,
  User,
  Trash2,
  Clock,
  CheckCircle2,
  List,
  Grid,
  Loader2,
  X,
  FileText,
  UserPlus,
  HelpCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Member {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface PostItem {
  id: string
  title: string
  category: string
  assigneeName: string
  assigneeAvatar?: string
  status: 'todo' | 'inprogress' | 'done'
  dueDate: string
  platforms: string[]
  commentCount: number
  imageUrl: string
}

const baseInitialPosts: PostItem[] = [
  // À faire (todo)
  {
    id: 'p1',
    title: '5 astuces pour mieux dormir',
    category: 'Conseils bien-être',
    assigneeName: 'Naomi',
    status: 'todo',
    dueDate: '20 mai 2025',
    platforms: ['instagram', 'tiktok'],
    commentCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?w=150&q=80'
  },
  {
    id: 'p2',
    title: 'Découvrez notre nouvelle gamme',
    category: 'Produit',
    assigneeName: 'Lucas',
    status: 'todo',
    dueDate: '22 mai 2025',
    platforms: ['instagram', 'facebook'],
    commentCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=150&q=80'
  },
  {
    id: 'p3',
    title: 'Behind the scenes du shooting',
    category: 'Coulisses',
    assigneeName: 'Chloé',
    status: 'todo',
    dueDate: '25 mai 2025',
    platforms: ['tiktok'],
    commentCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=150&q=80'
  },
  // En cours (inprogress)
  {
    id: 'p4',
    title: 'Checklist pour un feed parfait',
    category: 'Conseils',
    assigneeName: 'Naomi',
    status: 'inprogress',
    dueDate: '18 mai 2025',
    platforms: ['instagram', 'pinterest'],
    commentCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&q=80'
  },
  {
    id: 'p5',
    title: 'Tendances réseaux sociaux 2025',
    category: 'Veille',
    assigneeName: 'Lucas',
    status: 'inprogress',
    dueDate: '21 mai 2025',
    platforms: ['linkedin', 'twitter'],
    commentCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=150&q=80'
  },
  // Terminé (done)
  {
    id: 'p6',
    title: 'Routine skincare du matin',
    category: 'Tutoriel',
    assigneeName: 'Chloé',
    status: 'done',
    dueDate: '15 mai 2025',
    platforms: ['instagram', 'tiktok'],
    commentCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&q=80'
  },
  {
    id: 'p7',
    title: 'Pourquoi choisir nos soins ?',
    category: 'Éducation',
    assigneeName: 'Naomi',
    status: 'done',
    dueDate: '10 mai 2025',
    platforms: ['facebook', 'instagram'],
    commentCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&q=80'
  }
]

const baseMockMembers = [
  { id: 'm1', name: 'Naomi K.', role: 'Propriétaire', avatar: 'NK' },
  { id: 'm2', name: 'Lucas M.', role: 'Éditeur', avatar: 'LM' },
  { id: 'm3', name: 'Chloé D.', role: 'Rédactrice', avatar: 'CD' },
  { id: 'm4', name: 'Thomas R.', role: 'Designer', avatar: 'TR' }
]

export default function ProjetsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostItem[]>(baseInitialPosts)
  const [teamMembers, setTeamMembers] = useState<any[]>(baseMockMembers)
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'inprogress' | 'done'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('')
  const [newPostAssignee, setNewPostAssignee] = useState('')
  const [newPostStatus, setNewPostStatus] = useState<'todo' | 'inprogress' | 'done'>('todo')
  const [newPostDueDate, setNewPostDueDate] = useState('')
  const [newPostPlatforms, setNewPostPlatforms] = useState<string[]>([])
  
  const [submittingPost, setSubmittingPost] = useState(false)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Fetch real team members to populate the lists/assignee options
  useEffect(() => {
    fetch('/api/team/members')
      .then(r => {
        if (r.ok) return r.json()
        throw new Error('No team')
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((m, i) => {
            const roleLabel = m.role === 'owner' ? 'Propriétaire' 
                            : m.role === 'admin' ? 'Administrateur' 
                            : m.role === 'editor' ? 'Éditeur' 
                            : 'Invité'
            return {
              id: m.id,
              name: m.name || m.email.split('@')[0],
              role: roleLabel,
              avatar: (m.name || m.email).substring(0, 2).toUpperCase()
            }
          })
          setTeamMembers(formatted)
        }
      })
      .catch(err => {
        // Safe fallback
        setTeamMembers(baseMockMembers)
      })
  }, [])

  // Filter posts based on selection
  const filteredPosts = posts.filter(post => {
    const matchesStatus = activeFilter === 'all' || post.status === activeFilter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Get status details
  const todoPosts = posts.filter(p => p.status === 'todo')
  const inprogressPosts = posts.filter(p => p.status === 'inprogress')
  const donePosts = posts.filter(p => p.status === 'done')

  // Render Platform SVG Icon
  const renderPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <span className="size-5 rounded-md bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm" title="Instagram">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </span>
        )
      case 'facebook':
        return (
          <span className="size-5 rounded-md bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-sm" title="Facebook">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </span>
        )
      case 'linkedin':
        return (
          <span className="size-5 rounded-md bg-[#0A66C2] flex items-center justify-center text-white shrink-0 shadow-sm" title="LinkedIn">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect width="4" height="12" x="2" y="9"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </span>
        )
      case 'twitter':
        return (
          <span className="size-5 rounded-md bg-black flex items-center justify-center text-white shrink-0 shadow-sm" title="X (Twitter)">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </span>
        )
      case 'pinterest':
        return (
          <span className="size-5 rounded-md bg-[#BD081C] flex items-center justify-center text-white shrink-0 shadow-sm" title="Pinterest">
            <span className="font-bold text-[10px]">P</span>
          </span>
        )
      case 'tiktok':
        return (
          <span className="size-5 rounded-md bg-black flex items-center justify-center text-white shrink-0 shadow-sm" title="TikTok">
            <span className="font-bold text-[10px] tracking-tight">🎵</span>
          </span>
        )
      case 'youtube':
        return (
          <span className="size-5 rounded-md bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-sm" title="YouTube">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
              <polygon points="10 15 15 12 10 9"/>
            </svg>
          </span>
        )
      default:
        return (
          <span className="size-5 rounded-md bg-gray-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Layers className="size-3" />
          </span>
        )
    }
  }

  // Handle adding new post
  const handleAddPostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostTitle.trim()) return

    setSubmittingPost(true)
    setTimeout(() => {
      const selectedAssignee = teamMembers.find(m => m.id === newPostAssignee || m.name === newPostAssignee)
      const assigneeName = selectedAssignee ? selectedAssignee.name.split(' ')[0] : 'Naomi'
      
      const newPost: PostItem = {
        id: `p-${Date.now()}`,
        title: newPostTitle.trim(),
        category: newPostCategory.trim() || 'Contenu',
        assigneeName,
        status: newPostStatus,
        dueDate: newPostDueDate ? new Date(newPostDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '26 mai 2025',
        platforms: newPostPlatforms.length > 0 ? newPostPlatforms : ['instagram'],
        commentCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=150&q=80' // default aesthetic coffee desk mockup
      }

      setPosts(prev => [newPost, ...prev])
      setNewPostTitle('')
      setNewPostCategory('')
      setNewPostPlatforms([])
      setShowAddModal(false)
      setSubmittingPost(false)
      toast.success("Post créé avec succès dans l'espace projet.")
    }, 600)
  }

  // Handle toggle platform selection in modal
  const toggleModalPlatform = (plat: string) => {
    if (newPostPlatforms.includes(plat)) {
      setNewPostPlatforms(prev => prev.filter(p => p !== plat))
    } else {
      setNewPostPlatforms(prev => [...prev, plat])
    }
  }

  // Handle deleting post
  const handleDeletePost = (id: string) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.filter(p => p.id !== id))
    toast.success("Post supprimé du board.")
  }

  // Handle update status in list
  const handleUpdateStatus = (id: string, nextStatus: PostItem['status']) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
    toast.success(`Statut mis à jour !`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10">
      
      {/* LEFT MAIN PROJECTS BOARD SECTION */}
      <div className="flex-1 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Projets de l'équipe
              <HelpCircle className="size-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </h1>
            <p className="text-sm text-gray-500 mt-1">Organisez et collaborez sur vos contenus.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/equipe/membres?invite=true')}
            className="inline-flex items-center justify-center gap-2 bg-[#EEEDFE] hover:bg-[#dedcfb] text-[#534AB7] border border-purple-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="size-4" />
            Inviter un membre
          </button>
        </div>

        {/* TABS & VIEW CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-1">
          {/* TABS */}
          <div className="flex gap-6">
            <button className="flex items-center gap-1.5 pb-3 text-[#534AB7] font-bold text-xs border-b-2 border-[#534AB7] transition-all">
              <List className="size-4" />
              Vue Liste
            </button>
            <button className="flex items-center gap-1.5 pb-3 text-gray-400 font-bold text-xs hover:text-gray-600 border-b-2 border-transparent transition-all cursor-not-allowed">
              <Calendar className="size-4" />
              Calendrier
            </button>
            <button className="flex items-center gap-1.5 pb-3 text-gray-400 font-bold text-xs hover:text-gray-600 border-b-2 border-transparent transition-all cursor-not-allowed">
              <FolderKanban className="size-4" />
              Kanban
            </button>
          </div>

          {/* VIEW SWITCHER / SEARCH */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all w-full"
              />
              <Search className="size-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Dropdown Projects */}
            <div className="relative">
              <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer">
                <span>Tous les projets</span>
                <ChevronDown className="size-3.5 text-gray-500" />
              </button>
            </div>

            {/* Grid Toggle Buttons */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <button className="p-1.5 bg-white text-[#534AB7] shrink-0">
                <List className="size-3.5" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0 cursor-not-allowed">
                <Grid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* LIST TABLE SECTION */}
        <div className="space-y-6">
          
          {/* GROUP: À FAIRE */}
          {(activeFilter === 'all' || activeFilter === 'todo') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">À faire</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                  {todoPosts.length}
                </span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {todoPosts.map(post => (
                    <PostRow key={post.id} post={post} onUpdateStatus={handleUpdateStatus} onDeletePost={handleDeletePost} activeDropdownId={activeDropdownId} setActiveDropdownId={setActiveDropdownId} renderPlatformIcon={renderPlatformIcon} />
                  ))}
                  {todoPosts.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400 font-medium">Aucun contenu à faire.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GROUP: EN COURS */}
          {(activeFilter === 'all' || activeFilter === 'inprogress') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">En cours</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                  {inprogressPosts.length}
                </span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {inprogressPosts.map(post => (
                    <PostRow key={post.id} post={post} onUpdateStatus={handleUpdateStatus} onDeletePost={handleDeletePost} activeDropdownId={activeDropdownId} setActiveDropdownId={setActiveDropdownId} renderPlatformIcon={renderPlatformIcon} />
                  ))}
                  {inprogressPosts.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400 font-medium">Aucun contenu en cours de rédaction.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GROUP: TERMINÉ */}
          {(activeFilter === 'all' || activeFilter === 'done') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="size-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Terminé</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                  {donePosts.length}
                </span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {donePosts.map(post => (
                    <PostRow key={post.id} post={post} onUpdateStatus={handleUpdateStatus} onDeletePost={handleDeletePost} activeDropdownId={activeDropdownId} setActiveDropdownId={setActiveDropdownId} renderPlatformIcon={renderPlatformIcon} />
                  ))}
                  {donePosts.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400 font-medium">Aucun contenu terminé.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ADD POST CTA BUTTON STRETCHING AT BOTTOM */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3 border border-dashed border-[#534AB7]/30 hover:border-[#534AB7] bg-purple-50/10 hover:bg-[#EEEDFE]/40 text-xs text-[#534AB7] font-bold rounded-2xl transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            Ajouter un post
          </button>
        </div>

      </div>

      {/* RIGHT SIDE PANEL FILTERS */}
      <div className="w-full lg:w-64 space-y-6">
        
        {/* FAST FILTERS CARD */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Filtres rapides</h3>
          <div className="space-y-1.5">
            {/* Filter: All */}
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                activeFilter === 'all' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full border border-purple-500 flex shrink-0" />
                <span>Tous les posts</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {posts.length}
              </span>
            </button>

            {/* Filter: Todo */}
            <button
              onClick={() => setActiveFilter('todo')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                activeFilter === 'todo' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 flex shrink-0" />
                <span>À faire</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {todoPosts.length}
              </span>
            </button>

            {/* Filter: In progress */}
            <button
              onClick={() => setActiveFilter('inprogress')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                activeFilter === 'inprogress' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500 flex shrink-0" />
                <span>En cours</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {inprogressPosts.length}
              </span>
            </button>

            {/* Filter: Done */}
            <button
              onClick={() => setActiveFilter('done')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                activeFilter === 'done' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 flex shrink-0" />
                <span>Terminé</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {donePosts.length}
              </span>
            </button>
          </div>
        </div>

        {/* TEAM MEMBERS SIDEBAR LIST */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Membres de l'équipe</h3>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-primary/10 border border-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{member.name}</div>
                    <div className="text-[9px] text-gray-400 font-medium">{member.role}</div>
                  </div>
                </div>
                {member.role === 'Propriétaire' && (
                  <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md border border-purple-200">
                    Propriétaire
                  </span>
                )}
                {member.role === 'Éditeur' && (
                  <span className="text-[9px] font-bold bg-[#EEEDFE] text-[#534AB7] px-1.5 py-0.5 rounded-md border border-purple-100">
                    Éditeur
                  </span>
                )}
                {member.role === 'Rédactrice' && (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200">
                    Rédactrice
                  </span>
                )}
                {member.role === 'Designer' && (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200">
                    Designer
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ADD POST MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 border border-gray-100 flex flex-col relative"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="size-5 text-[#534AB7]" />
                  Ajouter un post au board
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddPostSubmit} className="p-6 space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="post-title" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Titre du post
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    required
                    placeholder="ex. 10 astuces pour booster sa visibilité"
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="post-cat" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Catégorie
                    </label>
                    <input
                      id="post-cat"
                      type="text"
                      placeholder="ex. Conseils, Produit"
                      value={newPostCategory}
                      onChange={e => setNewPostCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="post-status" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Statut initial
                    </label>
                    <div className="relative">
                      <select
                        id="post-status"
                        value={newPostStatus}
                        onChange={e => setNewPostStatus(e.target.value as any)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all cursor-pointer font-medium"
                      >
                        <option value="todo">À faire</option>
                        <option value="inprogress">En cours</option>
                        <option value="done">Terminé</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <ChevronDown className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="post-assign" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Assigné à
                    </label>
                    <div className="relative">
                      <select
                        id="post-assign"
                        value={newPostAssignee}
                        onChange={e => setNewPostAssignee(e.target.value)}
                        required
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all cursor-pointer font-medium"
                      >
                        <option value="">Sélectionner</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <ChevronDown className="size-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="post-due" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Échéance
                    </label>
                    <input
                      id="post-due"
                      type="date"
                      value={newPostDueDate}
                      onChange={e => setNewPostDueDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Platforms selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Plateformes
                  </label>
                  <div className="flex gap-2">
                    {['instagram', 'tiktok', 'linkedin', 'facebook', 'pinterest'].map(plat => {
                      const active = newPostPlatforms.includes(plat)
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => toggleModalPlatform(plat)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                            active 
                              ? 'bg-purple-100 text-[#534AB7] border-[#534AB7]/30' 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {plat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#534AB7] hover:bg-[#453da3] text-white font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingPost ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Créer le post
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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

// Sub-Component PostRow for list layout
function PostRow({
  post,
  onUpdateStatus,
  onDeletePost,
  activeDropdownId,
  setActiveDropdownId,
  renderPlatformIcon
}: {
  post: PostItem
  onUpdateStatus: (id: string, nextStatus: PostItem['status']) => void
  onDeletePost: (id: string) => void
  activeDropdownId: string | null
  setActiveDropdownId: (id: string | null) => void
  renderPlatformIcon: (plat: string) => React.ReactNode
}) {
  const isDropdownOpen = activeDropdownId === post.id
  
  const statusLabels = {
    todo: 'À faire',
    inprogress: 'En cours',
    done: 'Terminé'
  }

  const statusStyles = {
    todo: 'bg-amber-50 text-amber-700 border-amber-200',
    inprogress: 'bg-blue-50 text-blue-700 border-blue-200',
    done: 'bg-green-50 text-green-700 border-green-200'
  }

  const initials = post.assigneeName.substring(0, 2).toUpperCase()

  return (
    <div className="flex items-center py-3.5 px-4 hover:bg-gray-50/50 transition-colors gap-4">
      {/* Checkbox / Toggle (Dummy decoration matching mockup layout) */}
      <div className="flex shrink-0">
        <input 
          type="checkbox" 
          className="size-4 rounded border-gray-300 text-primary focus:ring-primary/40 cursor-pointer" 
        />
      </div>

      {/* Post Thumbnail & Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="size-10 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
        />
        <div className="min-w-0">
          <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
            {post.title}
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {post.category}
          </div>
        </div>
      </div>

      {/* Assigned User */}
      <div className="w-28 shrink-0 hidden sm:flex items-center gap-2">
        <div className="size-6 rounded-full bg-primary/10 border border-primary/10 text-primary font-bold flex items-center justify-center text-[9px] shrink-0">
          {initials}
        </div>
        <span className="text-xs font-semibold text-gray-700">{post.assigneeName}</span>
      </div>

      {/* Status Badge */}
      <div className="w-24 shrink-0">
        <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusStyles[post.status]}`}>
          {statusLabels[post.status]}
        </span>
      </div>

      {/* Due Date */}
      <div className="w-28 shrink-0 hidden md:block text-xs font-semibold text-gray-500">
        {post.dueDate}
      </div>

      {/* Platforms */}
      <div className="w-24 shrink-0 flex items-center gap-1">
        {post.platforms.map(plat => (
          <span key={plat}>{renderPlatformIcon(plat)}</span>
        ))}
      </div>

      {/* Comments */}
      <div className="w-16 shrink-0 flex items-center gap-1 text-gray-400 font-bold text-xs">
        <MessageSquare className="size-3.5" />
        <span>{post.commentCount}</span>
      </div>

      {/* Actions */}
      <div className="relative shrink-0 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setActiveDropdownId(isDropdownOpen ? null : post.id)
          }}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreVertical className="size-4" />
        </button>

        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setActiveDropdownId(null)} 
            />
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
              <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                Changer le statut
              </div>
              {post.status !== 'todo' && (
                <button
                  onClick={() => onUpdateStatus(post.id, 'todo')}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                  À faire
                </button>
              )}
              {post.status !== 'inprogress' && (
                <button
                  onClick={() => onUpdateStatus(post.id, 'inprogress')}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                  En cours
                </button>
              )}
              {post.status !== 'done' && (
                <button
                  onClick={() => onUpdateStatus(post.id, 'done')}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                  Terminé
                </button>
              )}
              <div className="border-t border-gray-50 my-1" />
              <button
                onClick={() => onDeletePost(post.id)}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Supprimer
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
