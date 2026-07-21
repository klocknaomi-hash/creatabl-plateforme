'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useOrganization } from '@clerk/nextjs'
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
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  PlusCircle,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { NotificationsPopover } from '@/components/dashboard/notifications-popover'
import { Button } from '@/components/ui/button'

// Interfaces
interface CommentItem {
  id: string
  author: string
  avatar: string
  text: string
  date: string
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
  comments?: CommentItem[]
}

interface Member {
  id: string
  name: string
  role: string
  avatar: string
  imageUrl: string
}

// Date utils for french months
const parsePostDate = (dateStr: string): Date | null => {
  const parts = dateStr.toLowerCase().split(' ')
  if (parts.length < 3) return null
  const day = parseInt(parts[0], 10)
  const year = parseInt(parts[2], 10)
  const months: Record<string, number> = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
    'fevrier': 1, 'aout': 7
  }
  const month = months[parts[1]] ?? 4
  return new Date(year, month, day)
}

const convertToInputDate = (dateStr: string): string => {
  const parsed = parsePostDate(dateStr)
  if (!parsed) return ''
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const convertFromInputDate = (dateStr: string): string => {
  if (!dateStr) return 'Aujourd\'hui'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProjetsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { organization, memberships } = useOrganization({
    memberships: {
      pageSize: 50,
    },
  })

  // Real Team Members from Clerk active Organization
  const teamMembers: Member[] = useMemo(() => {
    if (memberships?.data && memberships.data.length > 0) {
      return memberships.data.map((m) => {
        const userData = m.publicUserData
        const firstName = userData?.firstName || ''
        const lastName = userData?.lastName || ''
        const identifier = userData?.identifier || ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        const name = fullName || identifier || 'Membre'
        const roleLabel = m.role === 'org:admin' ? 'Administrateur' : 'Membre'
        return {
          id: userData?.userId || m.id,
          name,
          role: roleLabel,
          avatar: name.substring(0, 2).toUpperCase(),
          imageUrl: userData?.imageUrl || '',
        }
      })
    }

    if (user) {
      const name = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Moi'
      return [{
        id: user.id,
        name,
        role: 'Propriétaire',
        avatar: name.substring(0, 2).toUpperCase(),
        imageUrl: user.imageUrl || '',
      }]
    }

    return []
  }, [memberships, user])

  const [posts, setPosts] = useState<PostItem[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  
  // Views states
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list')
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'inprogress' | 'done'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)
  
  // Selected items (Bulk action checkboxes)
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  
  // Dropdowns status
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('')
  const [newPostAssignee, setNewPostAssignee] = useState('')
  const [newPostStatus, setNewPostStatus] = useState<'todo' | 'inprogress' | 'done'>('todo')
  const [newPostDueDate, setNewPostDueDate] = useState('')
  const [newPostPlatforms, setNewPostPlatforms] = useState<string[]>([])
  
  // Edit post state
  const [editingPost, setEditingPost] = useState<PostItem | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  
  // Calendar states
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  
  const [submittingPost, setSubmittingPost] = useState(false)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Fetch real posts scoped by organization
  const fetchRealPosts = async () => {
    setLoadingPosts(true)
    try {
      const res = await fetch('/api/team/projects')
      if (res.ok) {
        const data = await res.json()
        const fetchedPosts: PostItem[] = (Array.isArray(data) ? data : data.posts || []).map((p: any) => {
          const statusMap: Record<string, 'todo' | 'inprogress' | 'done'> = {
            draft: 'todo',
            scheduled: 'inprogress',
            published: 'done',
            failed: 'todo',
          }
          const mappedStatus = statusMap[p.status] || 'todo'
          const date = p.scheduledAt || p.createdAt
          const dueDateStr = date
            ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Sans date'

          const assignedMember = teamMembers[0] || {
            name: user?.fullName || 'Membre',
            imageUrl: user?.imageUrl || '',
          }

          return {
            id: p.id,
            title: p.content ? (p.content.length > 60 ? p.content.slice(0, 60) + '…' : p.content) : 'Post sans titre',
            category: (p.platforms && p.platforms[0]) ? String(p.platforms[0]).toUpperCase() : 'Contenu',
            assigneeName: assignedMember.name,
            assigneeAvatar: assignedMember.imageUrl,
            status: mappedStatus,
            dueDate: dueDateStr,
            platforms: p.platforms || [],
            commentCount: 0,
            imageUrl: (p.mediaUrls && p.mediaUrls[0]) ? p.mediaUrls[0] : '',
            comments: [],
          }
        })
        setPosts(fetchedPosts)
      }
    } catch (err) {
      console.error('Error fetching real posts for team projects:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    fetchRealPosts()
  }, [organization?.id])

  // Filter posts based on all active parameters
  const filteredPosts = posts.filter(post => {
    const matchesStatus = activeFilter === 'all' || post.status === activeFilter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    
    let matchesMember = true
    if (selectedMemberName) {
      matchesMember = post.assigneeName.toLowerCase().includes(selectedMemberName.toLowerCase())
    }

    return matchesStatus && matchesSearch && matchesCategory && matchesMember
  })

  // Grouped status counts for UI indicators
  const todoPosts = filteredPosts.filter(p => p.status === 'todo')
  const inprogressPosts = filteredPosts.filter(p => p.status === 'inprogress')
  const donePosts = filteredPosts.filter(p => p.status === 'done')

  // Total counts for fast filters column
  const totalCountTodo = posts.filter(p => p.status === 'todo').length
  const totalCountInprogress = posts.filter(p => p.status === 'inprogress').length
  const totalCountDone = posts.filter(p => p.status === 'done').length

  // Available unique categories for filtering
  const categoriesList = Array.from(new Set(posts.map(p => p.category)))

  // Platforms renderer
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
      case 'x':
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
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
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
      const assigneeName = selectedAssignee ? selectedAssignee.name : (user?.fullName || 'Membre')
      const assigneeAvatar = selectedAssignee ? selectedAssignee.imageUrl : user?.imageUrl
      
      const newPost: PostItem = {
        id: `p-${Date.now()}`,
        title: newPostTitle.trim(),
        category: newPostCategory.trim() || 'Contenu',
        assigneeName,
        assigneeAvatar,
        status: newPostStatus,
        dueDate: newPostDueDate ? convertFromInputDate(newPostDueDate) : 'Aujourd\'hui',
        platforms: newPostPlatforms.length > 0 ? newPostPlatforms : ['instagram'],
        commentCount: 0,
        imageUrl: '',
        comments: []
      }

      setPosts(prev => [newPost, ...prev])
      setNewPostTitle('')
      setNewPostCategory('')
      setNewPostPlatforms([])
      setShowAddModal(false)
      setSubmittingPost(false)
      toast.success("Projet créé avec succès.")
    }, 400)
  }

  const toggleModalPlatform = (plat: string) => {
    if (newPostPlatforms.includes(plat)) {
      setNewPostPlatforms(prev => prev.filter(p => p !== plat))
    } else {
      setNewPostPlatforms(prev => [...prev, plat])
    }
  }

  const handleDeletePost = (id: string) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.filter(p => p.id !== id))
    setSelectedPostIds(prev => prev.filter(item => item !== id))
    toast.success("Post supprimé du board.")
  }

  const handleUpdateStatus = (id: string, nextStatus: PostItem['status']) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
    toast.success(`Statut mis à jour !`)
  }

  const handleToggleSelectPost = (id: string) => {
    setSelectedPostIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredPosts.map(p => p.id)
    const allSelected = allFilteredIds.every(id => selectedPostIds.includes(id))
    if (allSelected) {
      setSelectedPostIds(prev => prev.filter(id => !allFilteredIds.includes(id)))
    } else {
      setSelectedPostIds(prev => Array.from(new Set([...prev, ...allFilteredIds])))
    }
  }

  const handleBulkDelete = () => {
    setPosts(prev => prev.filter(p => !selectedPostIds.includes(p.id)))
    setSelectedPostIds([])
    toast.success("Posts sélectionnés supprimés.")
  }

  const handleBulkStatusChange = (status: PostItem['status']) => {
    setPosts(prev => prev.map(p => selectedPostIds.includes(p.id) ? { ...p, status } : p))
    setSelectedPostIds([])
    toast.success("Statut des posts mis à jour.")
  }

  const handleMemberClick = (memberName: string) => {
    if (selectedMemberName === memberName) {
      setSelectedMemberName(null)
    } else {
      setSelectedMemberName(memberName)
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim() || !editingPost) return

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: user?.fullName || 'Moi',
      avatar: user?.imageUrl || '',
      text: newCommentText.trim(),
      date: "À l'instant"
    }

    const updatedComments = [...(editingPost.comments || []), newComment]
    const updatedPost = {
      ...editingPost,
      comments: updatedComments,
      commentCount: updatedComments.length
    }

    setEditingPost(updatedPost)
    setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p))
    setNewCommentText('')
    toast.success("Commentaire ajouté !")
  }

  const handleSavePostDetails = () => {
    if (!editingPost) return
    setPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost : p))
    setEditingPost(null)
    toast.success("Post enregistré avec succès.")
  }

  const getCalendarCells = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6
    
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevMonthTotalDays = new Date(year, month, 0).getDate()
    
    const cells = []
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      })
    }
    
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }
    
    return cells
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const nextMonth = direction === 'next' ? calendarDate.getMonth() + 1 : calendarDate.getMonth() - 1
    setCalendarDate(new Date(calendarDate.getFullYear(), nextMonth, 1))
  }

  const handleCalendarDayClick = (cellDate: Date) => {
    const y = cellDate.getFullYear()
    const m = String(cellDate.getMonth() + 1).padStart(2, '0')
    const d = String(cellDate.getDate()).padStart(2, '0')
    setNewPostDueDate(`${y}-${m}-${d}`)
    setShowAddModal(true)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10">
      
      {/* LEFT MAIN PROJECTS SECTION */}
      <div className="flex-1 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Projets de l'équipe
              <div className="group relative">
                <HelpCircle className="size-4 text-gray-400 cursor-pointer hover:text-gray-650 transition-colors" />
                <div className="absolute left-0 bottom-6 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded-lg w-56 font-normal shadow-lg z-30">
                  Gérez vos contenus éditoriaux, assignez les tâches et planifiez vos publications sur les réseaux sociaux.
                </div>
              </div>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Organisez et collaborez sur vos contenus.</p>
          </div>
          
          <div className="flex items-center gap-3.5 self-end sm:self-auto">
            <button
              onClick={() => router.push('/dashboard/equipe/membres?invite=true')}
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

        {/* TABS & VIEW CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-1">
          
          {/* VIEW TABS */}
          <div className="flex gap-6">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 pb-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                viewMode === 'list' ? 'text-[#534AB7] border-[#534AB7]' : 'text-gray-400 hover:text-gray-600 border-transparent'
              }`}
            >
              <List className="size-4" />
              Vue Liste
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 pb-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'text-[#534AB7] border-[#534AB7]' : 'text-gray-400 hover:text-gray-600 border-transparent'
              }`}
            >
              <Calendar className="size-4" />
              Calendrier
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 pb-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'text-[#534AB7] border-[#534AB7]' : 'text-gray-400 hover:text-gray-600 border-transparent'
              }`}
            >
              <FolderKanban className="size-4" />
              Kanban
            </button>
          </div>

          {/* VIEW SWITCHER / SEARCH / CATEGORY */}
          <div className="flex items-center gap-3 w-full sm:w-auto relative">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all w-full min-w-[130px]"
              />
              <Search className="size-3.5 text-gray-400 absolute left-2.5 top-2 pointer-events-none" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <span>{categoryFilter === 'all' ? 'Tous les projets' : categoryFilter}</span>
                <ChevronDown className="size-3.5 text-gray-500" />
              </button>

              <AnimatePresence>
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20"
                    >
                      <button
                        onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${categoryFilter === 'all' ? 'text-[#534AB7] bg-purple-50/50' : 'text-gray-700'}`}
                      >
                        Tous les projets
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      {categoriesList.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${categoryFilter === cat ? 'text-[#534AB7] bg-purple-50/50' : 'text-gray-700'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Grid/List quick toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 shrink-0 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#534AB7] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="size-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 shrink-0 transition-colors cursor-pointer ${viewMode === 'kanban' ? 'bg-white text-[#534AB7] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER / DYNAMIC CHIPS BAR */}
        {(selectedMemberName || categoryFilter !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap text-xs bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/50">
            <span className="text-gray-500 font-medium">Filtres actifs :</span>
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 text-[#534AB7] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                Projet: {categoryFilter}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setCategoryFilter('all')} />
              </span>
            )}
            {selectedMemberName && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 text-[#534AB7] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                Membre: {selectedMemberName}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedMemberName(null)} />
              </span>
            )}
            <button 
              onClick={() => { setCategoryFilter('all'); setSelectedMemberName(null); }}
              className="text-[10px] text-[#534AB7] hover:underline font-bold ml-auto cursor-pointer"
            >
              Réinitialiser tout
            </button>
          </div>
        )}

        {/* MAIN PANEL CONTENT */}
        <div className="space-y-6">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-3xl bg-muted/10">
              <Loader2 className="size-8 text-[#7C3AED] animate-spin mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Chargement des projets...</p>
            </div>
          ) : posts.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 my-6 shadow-sm max-w-2xl mx-auto">
              <div className="size-16 rounded-full bg-[#7F77DD]/10 text-[#7F77DD] flex items-center justify-center mx-auto mb-2">
                <FolderKanban className="size-8 text-[#7F77DD]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#111827]">Aucun projet en cours</h2>
              <p className="text-[#6B7280] text-sm max-w-sm mx-auto leading-relaxed">
                Créez votre premier post pour commencer à organiser votre équipe.
              </p>
              <div className="pt-2">
                <a
                  href="/dashboard/compose"
                  className="inline-flex items-center gap-2 bg-[#7F77DD] hover:bg-[#6C63D6] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-[#7F77DD]/20"
                >
                  + Créer un post
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* VIEW: LIST */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {/* TABLE HEADER ROW */}
                  <div className="flex items-center px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider gap-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex shrink-0">
                      <input 
                        type="checkbox" 
                        checked={filteredPosts.length > 0 && filteredPosts.every(p => selectedPostIds.includes(p.id))}
                        onChange={handleToggleSelectAll}
                        className="size-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]/40 cursor-pointer" 
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">Post / Titre</div>
                    <div className="w-28 shrink-0 hidden sm:block">Assigné à</div>
                    <div className="w-24 shrink-0">Statut</div>
                    <div className="w-28 shrink-0 hidden md:block">Échéance</div>
                    <div className="w-24 shrink-0">Plateformes</div>
                    <div className="w-16 shrink-0">Commentaires</div>
                    <div className="w-10 shrink-0 text-right"></div>
                  </div>

                  {/* GROUP: À FAIRE */}
                  {(activeFilter === 'all' || activeFilter === 'todo') && (
                    <div className="space-y-2">
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
                            <PostRow 
                              key={post.id} 
                              post={post} 
                              selected={selectedPostIds.includes(post.id)}
                              onToggleSelect={handleToggleSelectPost}
                              onUpdateStatus={handleUpdateStatus} 
                              onDeletePost={handleDeletePost} 
                              onEditPost={setEditingPost}
                              activeDropdownId={activeDropdownId} 
                              setActiveDropdownId={setActiveDropdownId} 
                              renderPlatformIcon={renderPlatformIcon} 
                            />
                          ))}
                          {todoPosts.length === 0 && (
                            <div className="p-6 text-center text-xs text-gray-400 font-medium bg-gray-50/50">Aucun contenu à faire.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GROUP: EN COURS */}
                  {(activeFilter === 'all' || activeFilter === 'inprogress') && (
                    <div className="space-y-2">
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
                            <PostRow 
                              key={post.id} 
                              post={post} 
                              selected={selectedPostIds.includes(post.id)}
                              onToggleSelect={handleToggleSelectPost}
                              onUpdateStatus={handleUpdateStatus} 
                              onDeletePost={handleDeletePost} 
                              onEditPost={setEditingPost}
                              activeDropdownId={activeDropdownId} 
                              setActiveDropdownId={setActiveDropdownId} 
                              renderPlatformIcon={renderPlatformIcon} 
                            />
                          ))}
                          {inprogressPosts.length === 0 && (
                            <div className="p-6 text-center text-xs text-gray-400 font-medium bg-gray-50/50">Aucun contenu en cours de rédaction.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GROUP: TERMINÉ */}
                  {(activeFilter === 'all' || activeFilter === 'done') && (
                    <div className="space-y-2">
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
                            <PostRow 
                              key={post.id} 
                              post={post} 
                              selected={selectedPostIds.includes(post.id)}
                              onToggleSelect={handleToggleSelectPost}
                              onUpdateStatus={handleUpdateStatus} 
                              onDeletePost={handleDeletePost} 
                              onEditPost={setEditingPost}
                              activeDropdownId={activeDropdownId} 
                              setActiveDropdownId={setActiveDropdownId} 
                              renderPlatformIcon={renderPlatformIcon} 
                            />
                          ))}
                          {donePosts.length === 0 && (
                            <div className="p-6 text-center text-xs text-gray-400 font-medium bg-gray-50/50">Aucun contenu terminé.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADD POST BUTTON */}
                  <button
                    onClick={() => router.push('/dashboard/compose')}
                    className="w-full flex items-center justify-center gap-1.5 py-3 border border-dashed border-[#534AB7]/30 hover:border-[#534AB7] bg-purple-50/10 hover:bg-[#EEEDFE]/40 text-xs text-[#534AB7] font-bold rounded-2xl transition-all cursor-pointer active:scale-99 shadow-sm"
                  >
                    <Plus className="size-4" />
                    Ajouter un post
                  </button>
                </div>
              )}

              {/* VIEW: CALENDAR */}
              {viewMode === 'calendar' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
                  {/* CALENDAR CONTROLS */}
                  <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <button onClick={() => navigateMonth('prev')} className="p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <ChevronLeft className="size-4 text-gray-600" />
                    </button>
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-gray-800">
                      {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => navigateMonth('next')} className="p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <ChevronRight className="size-4 text-gray-600" />
                    </button>
                  </div>

                  {/* CALENDAR GRID */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="text-[10px] font-bold text-center text-gray-400 uppercase py-1 select-none">
                        {day}
                      </div>
                    ))}

                    {getCalendarCells().map((cell, idx) => {
                      const cellPosts = filteredPosts.filter(p => p.dueDate.includes(cell.date.getDate().toString()))
                      const isToday = new Date().toDateString() === cell.date.toDateString()

                      return (
                        <div 
                          key={idx}
                          className={`min-h-[85px] border border-gray-50 rounded-xl p-1 flex flex-col justify-between group transition-all relative ${
                            cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/60 opacity-55'
                          } hover:border-[#534AB7]/30 hover:bg-purple-50/5`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isToday ? 'bg-[#534AB7] text-white' : 'text-gray-500'
                            }`}>
                              {cell.date.getDate()}
                            </span>
                            <button
                              onClick={() => handleCalendarDayClick(cell.date)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#534AB7] transition-opacity"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[70px]">
                            {cellPosts.map(p => (
                              <div
                                key={p.id}
                                onClick={() => setEditingPost(p)}
                                className={`text-[9px] font-bold p-1 rounded-md truncate cursor-pointer transition-all ${
                                  p.status === 'done' ? 'bg-green-100 text-green-800' :
                                  p.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* VIEW: KANBAN */}
              {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* COLUMN: TODO */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-amber-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">À faire</h3>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                        {todoPosts.length}
                      </span>
                    </div>
                    <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                      {todoPosts.map(post => (
                        <KanbanCard key={post.id} post={post} onEdit={setEditingPost} onDelete={handleDeletePost} onUpdateStatus={handleUpdateStatus} renderPlatformIcon={renderPlatformIcon} />
                      ))}
                      {todoPosts.length === 0 && (
                        <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post à faire.</div>
                      )}
                    </div>
                  </div>

                  {/* COLUMN: IN PROGRESS */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">En cours</h3>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                        {inprogressPosts.length}
                      </span>
                    </div>
                    <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                      {inprogressPosts.map(post => (
                        <KanbanCard key={post.id} post={post} onEdit={setEditingPost} onDelete={handleDeletePost} onUpdateStatus={handleUpdateStatus} renderPlatformIcon={renderPlatformIcon} />
                      ))}
                      {inprogressPosts.length === 0 && (
                        <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post en cours.</div>
                      )}
                    </div>
                  </div>

                  {/* COLUMN: DONE */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-green-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Terminé</h3>
                      </div>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                        {donePosts.length}
                      </span>
                    </div>
                    <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                      {donePosts.map(post => (
                        <KanbanCard key={post.id} post={post} onEdit={setEditingPost} onDelete={handleDeletePost} onUpdateStatus={handleUpdateStatus} renderPlatformIcon={renderPlatformIcon} />
                      ))}
                      {donePosts.length === 0 && (
                        <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post terminé.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL FILTERS */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        
        {/* FAST FILTERS CARD */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Filtres rapides</h3>
          <div className="space-y-1.5">
            {/* Filter: All */}
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
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
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                activeFilter === 'todo' ? 'bg-amber-50 text-amber-700 font-extrabold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 flex shrink-0" />
                <span>À faire</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {totalCountTodo}
              </span>
            </button>

            {/* Filter: In progress */}
            <button
              onClick={() => setActiveFilter('inprogress')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                activeFilter === 'inprogress' ? 'bg-blue-50 text-blue-700 font-extrabold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500 flex shrink-0" />
                <span>En cours</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {totalCountInprogress}
              </span>
            </button>

            {/* Filter: Done */}
            <button
              onClick={() => setActiveFilter('done')}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                activeFilter === 'done' ? 'bg-green-50 text-green-700 font-extrabold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 flex shrink-0" />
                <span>Terminé</span>
              </div>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 rounded-md">
                {totalCountDone}
              </span>
            </button>
          </div>
        </div>

        {/* TEAM MEMBERS SIDEBAR LIST */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Membres de l'équipe</span>
            {selectedMemberName && (
              <span className="text-[9px] text-[#534AB7] hover:underline cursor-pointer font-bold" onClick={() => setSelectedMemberName(null)}>
                Effacer
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {teamMembers.map(member => {
              const isSelected = selectedMemberName === member.name

              return (
                <div 
                  key={member.id} 
                  onClick={() => handleMemberClick(member.name)}
                  className={`flex justify-between items-center p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#EEEDFE] border-[#534AB7]/30 shadow-sm scale-102' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name} 
                        className="size-8 rounded-full border border-gray-100 shrink-0 object-cover" 
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold flex items-center justify-center text-xs shrink-0">
                        {member.avatar}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-gray-800 truncate">{member.name}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{member.role}</div>
                    </div>
                  </div>
                  
                  <span className="text-[9px] font-bold bg-purple-100 text-[#534AB7] px-1.5 py-0.5 rounded-md border border-purple-200/20 shrink-0">
                    {member.role}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* FLOATING BULK ACTIONS TOOLBAR */}
      <AnimatePresence>
        {selectedPostIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl px-6 py-3.5 z-40 flex items-center gap-6 text-white"
          >
            <div className="text-xs font-bold flex items-center gap-2 border-r border-gray-700 pr-5 shrink-0">
              <span className="size-5 rounded-full bg-[#534AB7] flex items-center justify-center text-[10px] text-white">
                {selectedPostIds.length}
              </span>
              <span>contenus sélectionnés</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkStatusChange('todo')}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30 transition-all cursor-pointer"
              >
                À faire
              </button>
              <button 
                onClick={() => handleBulkStatusChange('inprogress')}
                className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 rounded-lg text-[10px] font-bold border border-blue-500/30 transition-all cursor-pointer"
              >
                En cours
              </button>
              <button 
                onClick={() => handleBulkStatusChange('done')}
                className="px-2.5 py-1.5 bg-green-500/20 hover:bg-green-500/35 text-green-300 rounded-lg text-[10px] font-bold border border-green-500/30 transition-all cursor-pointer"
              >
                Terminé
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/35 text-red-300 rounded-lg text-[10px] font-bold border border-red-500/30 transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                Supprimer
              </button>
            </div>

            <button 
              onClick={() => setSelectedPostIds([])}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT POST MODAL */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setEditingPost(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-xl w-full p-6 z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* MODAL HEADER */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`size-3 rounded-full ${
                    editingPost.status === 'done' ? 'bg-green-500' : editingPost.status === 'inprogress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <h2 className="text-base font-bold text-gray-900 truncate max-w-xs">{editingPost.title}</h2>
                </div>
                <button 
                  onClick={() => setEditingPost(null)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* DETAILS CONTENT */}
              <div className="space-y-4 text-xs">
                {/* STATUS & DUE DATE */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Statut</span>
                    <select
                      value={editingPost.status}
                      onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                      className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7]"
                    >
                      <option value="todo">À faire</option>
                      <option value="inprogress">En cours</option>
                      <option value="done">Terminé</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Date d'échéance</span>
                    <input
                      type="date"
                      value={convertToInputDate(editingPost.dueDate)}
                      onChange={(e) => setEditingPost({ ...editingPost, dueDate: convertFromInputDate(e.target.value) })}
                      className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7]"
                    />
                  </div>
                </div>

                {/* TITLE EDIT */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Titre du post</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                  />
                </div>

                {/* COMMENTS SECTION */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-[#534AB7]" />
                    Commentaires ({editingPost.comments?.length || 0})
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editingPost.comments?.map(c => (
                      <div key={c.id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {c.avatar ? (
                              <img src={c.avatar} alt="" className="size-5 rounded-full object-cover" />
                            ) : (
                              <div className="size-5 rounded-full bg-purple-100 text-[#534AB7] font-bold text-[9px] flex items-center justify-center">
                                {c.author.substring(0, 2)}
                              </div>
                            )}
                            <span className="font-extrabold text-gray-800 text-[11px]">{c.author}</span>
                          </div>
                          <span className="text-[9px] text-gray-400">{c.date}</span>
                        </div>
                        <p className="text-gray-600 pl-7 text-[11px]">{c.text}</p>
                      </div>
                    ))}
                    {(!editingPost.comments || editingPost.comments.length === 0) && (
                      <div className="p-4 text-center text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Aucun commentaire pour le moment.
                      </div>
                    )}
                  </div>

                  {/* ADD COMMENT INPUT */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="bg-[#534AB7] hover:bg-[#453da3] disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Send className="size-3" />
                    </button>
                  </form>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { handleDeletePost(editingPost.id); setEditingPost(null); }}
                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Supprimer
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePostDetails}
                    className="px-4 py-2 text-xs font-bold bg-[#534AB7] hover:bg-[#453da3] text-white rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-md w-full p-6 z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Créer un nouveau projet</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddPostSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Titre du post / projet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lancement nouvelle gamme..."
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Catégorie</label>
                    <input
                      type="text"
                      placeholder="Ex: Produit, Conseils..."
                      value={newPostCategory}
                      onChange={e => setNewPostCategory(e.target.value)}
                      className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Statut</label>
                    <select
                      value={newPostStatus}
                      onChange={e => setNewPostStatus(e.target.value as any)}
                      className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    >
                      <option value="todo">À faire</option>
                      <option value="inprogress">En cours</option>
                      <option value="done">Terminé</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Assigner à</label>
                    <select
                      value={newPostAssignee}
                      onChange={e => setNewPostAssignee(e.target.value)}
                      className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date d'échéance</label>
                    <input
                      type="date"
                      value={newPostDueDate}
                      onChange={e => setNewPostDueDate(e.target.value)}
                      className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Plateformes</label>
                  <div className="flex gap-2 flex-wrap">
                    {['instagram', 'facebook', 'linkedin', 'tiktok', 'twitter', 'pinterest'].map(plat => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => toggleModalPlatform(plat)}
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          newPostPlatforms.includes(plat)
                            ? 'bg-[#EEEDFE] border-[#534AB7] text-[#534AB7]'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-4 py-2 text-xs font-bold bg-[#534AB7] hover:bg-[#453da3] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {submittingPost && <Loader2 className="size-3.5 animate-spin" />}
                    Créer
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

// SUB-COMPONENT: POST ROW FOR LIST VIEW
function PostRow({
  post,
  selected,
  onToggleSelect,
  onUpdateStatus,
  onDeletePost,
  onEditPost,
  activeDropdownId,
  setActiveDropdownId,
  renderPlatformIcon
}: {
  post: PostItem
  selected: boolean
  onToggleSelect: (id: string) => void
  onUpdateStatus: (id: string, status: PostItem['status']) => void
  onDeletePost: (id: string) => void
  onEditPost: (post: PostItem) => void
  activeDropdownId: string | null
  setActiveDropdownId: (id: string | null) => void
  renderPlatformIcon: (plat: string) => React.ReactNode
}) {
  const isDropdownOpen = activeDropdownId === post.id

  return (
    <div className={`flex items-center px-4 py-3 text-xs gap-4 transition-colors hover:bg-gray-50/70 group ${
      selected ? 'bg-purple-50/40' : ''
    }`}>
      {/* CHECKBOX */}
      <div className="flex shrink-0">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={() => onToggleSelect(post.id)}
          className="size-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]/40 cursor-pointer" 
        />
      </div>

      {/* POST TITLE & CATEGORY & IMAGE */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3 cursor-pointer" onClick={() => onEditPost(post)}>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="size-9 rounded-xl object-cover shrink-0 border border-gray-100" />
        ) : (
          <div className="size-9 rounded-xl bg-purple-50 text-[#534AB7] flex items-center justify-center font-bold text-xs shrink-0">
            <FileText className="size-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-extrabold text-gray-900 truncate group-hover:text-[#534AB7] transition-colors">
            {post.title}
          </div>
          <div className="text-[10px] text-gray-400 font-semibold">{post.category}</div>
        </div>
      </div>

      {/* ASSIGNEE */}
      <div className="w-28 shrink-0 hidden sm:flex items-center gap-2">
        {post.assigneeAvatar ? (
          <img src={post.assigneeAvatar} alt="" className="size-6 rounded-full object-cover shrink-0 border border-gray-100" />
        ) : (
          <div className="size-6 rounded-full bg-purple-100 text-[#534AB7] font-bold text-[9px] flex items-center justify-center shrink-0">
            {post.assigneeName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <span className="font-bold text-gray-700 truncate text-[11px]">{post.assigneeName}</span>
      </div>

      {/* STATUS BADGE */}
      <div className="w-24 shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold capitalize ${
          post.status === 'done' ? 'bg-green-50 text-green-700 border border-green-200/60' :
          post.status === 'inprogress' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
          'bg-amber-50 text-amber-700 border border-amber-200/60'
        }`}>
          <span className={`size-1.5 rounded-full ${
            post.status === 'done' ? 'bg-green-500' : post.status === 'inprogress' ? 'bg-blue-500' : 'bg-amber-500'
          }`} />
          {post.status === 'done' ? 'Terminé' : post.status === 'inprogress' ? 'En cours' : 'À faire'}
        </span>
      </div>

      {/* DUE DATE */}
      <div className="w-28 shrink-0 hidden md:flex items-center gap-1.5 text-gray-500 text-[11px] font-semibold">
        <Clock className="size-3 text-gray-400 shrink-0" />
        <span className="truncate">{post.dueDate}</span>
      </div>

      {/* PLATFORMS */}
      <div className="w-24 shrink-0 flex items-center gap-1">
        {post.platforms.map((plat, idx) => (
          <React.Fragment key={idx}>{renderPlatformIcon(plat)}</React.Fragment>
        ))}
      </div>

      {/* COMMENTS COUNT */}
      <div className="w-16 shrink-0 flex items-center gap-1 text-gray-400 font-bold text-[11px]">
        <MessageSquare className="size-3.5 text-gray-400" />
        <span>{post.commentCount || 0}</span>
      </div>

      {/* ACTION DROPDOWN */}
      <div className="w-10 shrink-0 text-right relative">
        <button
          onClick={() => setActiveDropdownId(isDropdownOpen ? null : post.id)}
          className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <MoreVertical className="size-4" />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setActiveDropdownId(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-30 text-left text-xs font-semibold"
              >
                <button
                  onClick={() => onEditPost(post)}
                  className="w-full px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                  <FileText className="size-3.5 text-[#534AB7]" />
                  Détails / Éditer
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => onUpdateStatus(post.id, 'todo')}
                  className="w-full px-3 py-1.5 hover:bg-gray-50 text-amber-700 flex items-center gap-2 text-[11px]"
                >
                  Statut: À faire
                </button>
                <button
                  onClick={() => onUpdateStatus(post.id, 'inprogress')}
                  className="w-full px-3 py-1.5 hover:bg-gray-50 text-blue-700 flex items-center gap-2 text-[11px]"
                >
                  Statut: En cours
                </button>
                <button
                  onClick={() => onUpdateStatus(post.id, 'done')}
                  className="w-full px-3 py-1.5 hover:bg-gray-50 text-green-700 flex items-center gap-2 text-[11px]"
                >
                  Statut: Terminé
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="w-full px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Supprimer
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// SUB-COMPONENT: KANBAN CARD
function KanbanCard({
  post,
  onEdit,
  onDelete,
  onUpdateStatus,
  renderPlatformIcon
}: {
  post: PostItem
  onEdit: (post: PostItem) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: PostItem['status']) => void
  renderPlatformIcon: (plat: string) => React.ReactNode
}) {
  return (
    <div 
      onClick={() => onEdit(post)}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#534AB7]/30 transition-all cursor-pointer space-y-3 group"
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] font-extrabold text-[#534AB7] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/60 truncate max-w-[120px]">
          {post.category}
        </span>
        <div className="flex items-center gap-1">
          {post.platforms.map((plat, idx) => (
            <React.Fragment key={idx}>{renderPlatformIcon(plat)}</React.Fragment>
          ))}
        </div>
      </div>

      <h4 className="font-extrabold text-xs text-gray-900 line-clamp-2 group-hover:text-[#534AB7] transition-colors leading-snug">
        {post.title}
      </h4>

      <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-semibold">
        <div className="flex items-center gap-1.5">
          {post.assigneeAvatar ? (
            <img src={post.assigneeAvatar} alt="" className="size-5 rounded-full object-cover shrink-0 border border-gray-100" />
          ) : (
            <div className="size-5 rounded-full bg-purple-100 text-[#534AB7] font-bold text-[8px] flex items-center justify-center shrink-0">
              {post.assigneeName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="truncate max-w-[80px] font-bold text-gray-700">{post.assigneeName}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="size-3 text-gray-400" />
          <span>{post.dueDate}</span>
        </div>
      </div>
    </div>
  )
}
