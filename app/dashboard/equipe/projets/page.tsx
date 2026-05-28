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

// Face avatar images (realistic stock images from Unsplash matching mockup)
const memberImages = {
  naomi: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80',
  lucas: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80',
  chloe: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80',
  thomas: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80',
}

const getMemberAvatar = (name: string): string => {
  const n = name.toLowerCase()
  if (n.includes('naomi')) return memberImages.naomi
  if (n.includes('lucas')) return memberImages.lucas
  if (n.includes('chloé') || n.includes('chloe')) return memberImages.chloe
  if (n.includes('thomas')) return memberImages.thomas
  return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80' // default
}

// Initial Mock Comments
const initialComments: Record<string, CommentItem[]> = {
  p1: [
    { id: 'c1', author: 'Naomi K.', avatar: memberImages.naomi, text: "Super article ! J'ai hâte de le publier sur Instagram.", date: 'Il y a 2 jours' },
    { id: 'c2', author: 'Lucas M.', avatar: memberImages.lucas, text: "Je pense qu'on devrait ajouter un visuel sur la dernière astuce.", date: 'Il y a 1 jour' }
  ],
  p3: [
    { id: 'c3', author: 'Chloé D.', avatar: memberImages.chloe, text: "Le montage vidéo est presque fini, le rendu est top.", date: 'Il y a 4 heures' }
  ],
  p4: [
    { id: 'c4', author: 'Naomi K.', avatar: memberImages.naomi, text: "Excellent guide ! Le visuel Pinterest est prêt ?", date: 'Il y a 3 jours' },
    { id: 'c5', author: 'Lucas M.', avatar: memberImages.lucas, text: "Oui, je viens de l'ajouter dans l'espace partagé.", date: 'Il y a 2 jours' },
    { id: 'c6', author: 'Thomas R.', avatar: memberImages.thomas, text: "J'ai adapté les formats pour le format épingle Pinterest.", date: 'Il y a 1 jour' }
  ],
  p6: [
    { id: 'c7', author: 'Chloé D.', avatar: memberImages.chloe, text: "Le Reel Instagram performe super bien !", date: 'Il y a 5 jours' },
    { id: 'c8', author: 'Naomi K.', avatar: memberImages.naomi, text: "Bravo Chloé, beau travail sur le format court.", date: 'Il y a 5 jours' }
  ]
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
    imageUrl: 'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?w=150&q=80',
    comments: initialComments.p1
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
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=150&q=80',
    comments: []
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
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=150&q=80',
    comments: initialComments.p3
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
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&q=80',
    comments: initialComments.p4
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
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=150&q=80',
    comments: []
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
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&q=80',
    comments: initialComments.p6
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
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&q=80',
    comments: []
  }
]

const baseMockMembers: Member[] = [
  { id: 'm1', name: 'Naomi K.', role: 'Propriétaire', avatar: 'NK', imageUrl: memberImages.naomi },
  { id: 'm2', name: 'Lucas M.', role: 'Éditeur', avatar: 'LM', imageUrl: memberImages.lucas },
  { id: 'm3', name: 'Chloé D.', role: 'Rédactrice', avatar: 'CD', imageUrl: memberImages.chloe },
  { id: 'm4', name: 'Thomas R.', role: 'Designer', avatar: 'TR', imageUrl: memberImages.thomas }
]

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
  if (!dateStr) return '26 mai 2025'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProjetsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostItem[]>(baseInitialPosts)
  const [teamMembers, setTeamMembers] = useState<Member[]>(baseMockMembers)
  
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
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2025, 4, 1)) // May 2025
  
  const [submittingPost, setSubmittingPost] = useState(false)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Sync / API Call
  useEffect(() => {
    fetch('/api/team/members')
      .then(r => {
        if (r.ok) return r.json()
        throw new Error('No team')
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((m) => {
            const roleLabel = m.role === 'owner' ? 'Propriétaire' 
                            : m.role === 'admin' ? 'Administrateur' 
                            : m.role === 'editor' ? 'Éditeur' 
                            : 'Invité'
            return {
              id: m.id,
              name: m.name || m.email.split('@')[0],
              role: roleLabel,
              avatar: (m.name || m.email).substring(0, 2).toUpperCase(),
              imageUrl: getMemberAvatar(m.name || m.email.split('@')[0])
            }
          })
          setTeamMembers(formatted)
        }
      })
      .catch(err => {
        setTeamMembers(baseMockMembers)
      })
  }, [])

  // Filter posts based on all active parameters
  const filteredPosts = posts.filter(post => {
    const matchesStatus = activeFilter === 'all' || post.status === activeFilter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    
    // Normalize matching member to check if post assignee corresponds
    let matchesMember = true
    if (selectedMemberName) {
      const cleanMemberName = selectedMemberName.replace(/\s*[A-Z]\.$/, '').toLowerCase() // e.g. "Naomi K." -> "naomi"
      matchesMember = post.assigneeName.toLowerCase().includes(cleanMemberName)
    }

    return matchesStatus && matchesSearch && matchesCategory && matchesMember
  })

  // Grouped status counts for UI indicators
  const todoPosts = filteredPosts.filter(p => p.status === 'todo')
  const inprogressPosts = filteredPosts.filter(p => p.status === 'inprogress')
  const donePosts = filteredPosts.filter(p => p.status === 'done')

  // Total counts for fast filters column (unfiltered by category/member for general counts)
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
      const assigneeName = selectedAssignee ? selectedAssignee.name.split(' ')[0] : 'Naomi'
      
      const newPost: PostItem = {
        id: `p-${Date.now()}`,
        title: newPostTitle.trim(),
        category: newPostCategory.trim() || 'Contenu',
        assigneeName,
        status: newPostStatus,
        dueDate: newPostDueDate ? convertFromInputDate(newPostDueDate) : '26 mai 2025',
        platforms: newPostPlatforms.length > 0 ? newPostPlatforms : ['instagram'],
        commentCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=150&q=80',
        comments: []
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

  const toggleModalPlatform = (plat: string) => {
    if (newPostPlatforms.includes(plat)) {
      setNewPostPlatforms(prev => prev.filter(p => p !== plat))
    } else {
      setNewPostPlatforms(prev => [...prev, plat])
    }
  }

  const toggleEditPlatform = (plat: string) => {
    if (!editingPost) return
    const currentPlats = editingPost.platforms || []
    const nextPlats = currentPlats.includes(plat)
      ? currentPlats.filter(p => p !== plat)
      : [...currentPlats, plat]
    setEditingPost(prev => prev ? { ...prev, platforms: nextPlats } : null)
  }

  // Handle deleting post
  const handleDeletePost = (id: string) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.filter(p => p.id !== id))
    setSelectedPostIds(prev => prev.filter(item => item !== id))
    toast.success("Post supprimé du board.")
  }

  // Handle update status
  const handleUpdateStatus = (id: string, nextStatus: PostItem['status']) => {
    setActiveDropdownId(null)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
    toast.success(`Statut mis à jour !`)
  }

  // Handle toggle selection for one post
  const handleToggleSelectPost = (id: string) => {
    setSelectedPostIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Handle select/deselect all active filtered posts
  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredPosts.map(p => p.id)
    const allSelected = allFilteredIds.every(id => selectedPostIds.includes(id))
    if (allSelected) {
      // Remove all active filtered posts from selected state
      setSelectedPostIds(prev => prev.filter(id => !allFilteredIds.includes(id)))
    } else {
      // Add all active filtered posts to selected state
      setSelectedPostIds(prev => Array.from(new Set([...prev, ...allFilteredIds])))
    }
  }

  // Bulk actions handlers
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

  // Handle member click filter
  const handleMemberClick = (memberName: string) => {
    if (selectedMemberName === memberName) {
      setSelectedMemberName(null)
    } else {
      setSelectedMemberName(memberName)
    }
  }

  // Handle comment submit
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim() || !editingPost) return

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'Naomi K.',
      avatar: memberImages.naomi,
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

  // Save detailed changes from Edit Modal
  const handleSavePostDetails = () => {
    if (!editingPost) return
    setPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost : p))
    setEditingPost(null)
    toast.success("Post enregistré avec succès.")
  }

  // Render Calendar Grid Helper
  const getCalendarCells = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    let startDayOfWeek = firstDay.getDay() - 1 // Mon = 0
    if (startDayOfWeek === -1) startDayOfWeek = 6
    
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevMonthTotalDays = new Date(year, month, 0).getDate()
    
    const cells = []
    
    // Prev month days filler
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    // Next month filler
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

  // Open Add Post Modal prefilled with date from Calendar Day click
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
                  Gerez vos contenus éditoriaux, assignez les tâches et planifiez vos publications sur les réseaux sociaux.
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
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80" 
              alt="Naomi K."
              className="size-9.5 rounded-full border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-all"
              onClick={() => toast.info("Connecté en tant que Naomi K.")}
            />
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
                onClick={() => { setNewPostDueDate(''); setShowAddModal(true); }}
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
                
                {/* WEEKNAMES HEADER */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-[10px] font-bold text-center text-gray-400 uppercase py-1 select-none">
                    {day}
                  </div>
                ))}

                {/* CELLS */}
                {getCalendarCells().map((cell, idx) => {
                  const cellPosts = filteredPosts.filter(p => isPostDueOnDate(p, cell.date))
                  const isToday = new Date().toDateString() === cell.date.toDateString()

                  return (
                    <div 
                      key={idx}
                      className={`min-h-[85px] border border-gray-50 rounded-xl p-1 flex flex-col justify-between group transition-all relative ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/60 opacity-55'
                      } hover:border-[#534AB7]/30 hover:bg-purple-50/5`}
                    >
                      {/* Date label */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isToday ? 'bg-[#534AB7] text-white' : 'text-gray-500'
                        }`}>
                          {cell.date.getDate()}
                        </span>
                        
                        {/* Hover Quick Add Post Icon */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCalendarDayClick(cell.date)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-purple-100 rounded-md text-[#534AB7] cursor-pointer"
                          title="Ajouter un post ce jour"
                        >
                          <PlusCircle className="size-3.5" />
                        </button>
                      </div>

                      {/* Posts tags inside day cell */}
                      <div className="mt-1 flex-1 flex flex-col gap-1 overflow-y-auto max-h-[50px] scrollbar-none">
                        {cellPosts.map(post => {
                          const statusColor = post.status === 'todo' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : post.status === 'inprogress' ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                          return (
                            <button
                              key={post.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingPost(post)
                              }}
                              className={`w-full text-left truncate text-[9px] font-bold p-1 rounded border shadow-sm transition-all flex items-center justify-between gap-1 hover:scale-[1.02] cursor-pointer ${statusColor}`}
                            >
                              <span className="truncate">{post.title}</span>
                              <img 
                                src={getMemberAvatar(post.assigneeName)} 
                                alt={post.assigneeName} 
                                className="size-3.5 rounded-full border border-white/50 shrink-0 object-cover" 
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

              </div>
            </div>
          )}

          {/* VIEW: KANBAN */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* COLUMN: TODO */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleBulkChangeStatusOfDragged('todo')}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]"
              >
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
                    <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post. Glissez une carte ici.</div>
                  )}
                </div>
              </div>

              {/* COLUMN: IN PROGRESS */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleBulkChangeStatusOfDragged('inprogress')}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]"
              >
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
                    <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post. Glissez une carte ici.</div>
                  )}
                </div>
              </div>

              {/* COLUMN: DONE */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleBulkChangeStatusOfDragged('done')}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 min-h-[400px]"
              >
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
                    <div className="py-10 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">Aucun post. Glissez une carte ici.</div>
                  )}
                </div>
              </div>

            </div>
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
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="size-8 rounded-full border border-gray-100 shrink-0 object-cover" 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-gray-800 truncate">{member.name}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{member.role}</div>
                    </div>
                  </div>
                  
                  {member.role === 'Propriétaire' && (
                    <span className="text-[9px] font-bold bg-purple-100 text-[#534AB7] px-1.5 py-0.5 rounded-md border border-purple-250/20 shrink-0">
                      Propriétaire
                    </span>
                  )}
                  {member.role !== 'Propriétaire' && (
                    <span className="text-[9px] font-bold bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-105 shrink-0">
                      {member.role}
                    </span>
                  )}
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
                className="px-2.5 py-1.5 bg-red-650/90 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold border border-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="size-3" />
                Supprimer
              </button>
            </div>

            <button 
              onClick={() => setSelectedPostIds([])}
              className="text-[10px] font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD POST MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 border border-gray-100 flex flex-col relative"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="size-5 text-[#534AB7]" />
                  Créer un nouveau contenu
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddPostSubmit} className="p-5 space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="post-title" className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Titre du post
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    required
                    autoFocus
                    placeholder="ex. 5 astuces pour booster sa visibilité"
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-semibold"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="post-cat" className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </label>
                    <input
                      id="post-cat"
                      type="text"
                      placeholder="ex. Conseils, Produit"
                      value={newPostCategory}
                      onChange={e => setNewPostCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="post-status" className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Statut initial
                    </label>
                    <div className="relative">
                      <select
                        id="post-status"
                        value={newPostStatus}
                        onChange={e => setNewPostStatus(e.target.value as any)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all cursor-pointer font-semibold"
                      >
                        <option value="todo">À faire</option>
                        <option value="inprogress">En cours</option>
                        <option value="done">Terminé</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-450">
                        <ChevronDown className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="post-assign" className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Assigné à
                    </label>
                    <div className="relative">
                      <select
                        id="post-assign"
                        value={newPostAssignee}
                        onChange={e => setNewPostAssignee(e.target.value)}
                        required
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all cursor-pointer font-semibold"
                      >
                        <option value="">Sélectionner</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-455">
                        <ChevronDown className="size-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="post-due" className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Échéance
                    </label>
                    <input
                      id="post-due"
                      type="date"
                      value={newPostDueDate}
                      onChange={e => setNewPostDueDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Platforms selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Plateformes
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {['instagram', 'tiktok', 'linkedin', 'facebook', 'pinterest'].map(plat => {
                      const active = newPostPlatforms.includes(plat)
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => toggleModalPlatform(plat)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                            active 
                              ? 'bg-purple-100 text-[#534AB7] border-[#534AB7]/30' 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-105'
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
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#534AB7] hover:bg-[#453da3] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-97 shadow-sm"
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
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT POST DRAWER / DETAIL PANEL */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setEditingPost(null)} />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col z-10"
            >
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-55">
                <div className="flex items-center gap-2">
                  <FolderKanban className="size-5 text-[#534AB7]" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modifier le contenu</span>
                </div>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* Visual Cover Preview */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                  <img src={editingPost.imageUrl} alt={editingPost.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="bg-[#534AB7] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      {editingPost.category}
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Titre</label>
                    <input 
                      type="text"
                      value={editingPost.title}
                      onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    />
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Catégorie</label>
                      <input 
                        type="text"
                        value={editingPost.category}
                        onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                      />
                    </div>
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Statut</label>
                      <select
                        value={editingPost.status}
                        onChange={e => setEditingPost({ ...editingPost, status: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white cursor-pointer"
                      >
                        <option value="todo">À faire</option>
                        <option value="inprogress">En cours</option>
                        <option value="done">Terminé</option>
                      </select>
                    </div>
                  </div>

                  {/* Assignee & Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Assigné à</label>
                      <select
                        value={editingPost.assigneeName}
                        onChange={e => setEditingPost({ ...editingPost, assigneeName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white cursor-pointer"
                      >
                        {teamMembers.map(m => {
                          const simpleName = m.name.split(' ')[0]
                          return (
                            <option key={m.id} value={simpleName}>{m.name}</option>
                          )
                        })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Échéance</label>
                      <input 
                        type="date"
                        value={convertToInputDate(editingPost.dueDate)}
                        onChange={e => setEditingPost({ ...editingPost, dueDate: convertFromInputDate(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Platforms selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Plateformes</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['instagram', 'tiktok', 'linkedin', 'facebook', 'pinterest'].map(plat => {
                        const active = editingPost.platforms.includes(plat)
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => toggleEditPlatform(plat)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
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
                </div>

                <hr className="border-gray-100" />

                {/* COMMENTS SECTION */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-[#534AB7]" />
                    Commentaires ({editingPost.comments?.length || 0})
                  </h4>
                  
                  {/* List comments */}
                  <div className="space-y-3">
                    {editingPost.comments && editingPost.comments.length > 0 ? (
                      editingPost.comments.map(c => (
                        <div key={c.id} className="flex gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <img src={c.avatar} alt={c.author} className="size-7 rounded-full shrink-0 object-cover border border-white" />
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-gray-800">{c.author}</span>
                              <span className="text-[9px] text-gray-400 font-semibold">{c.date}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 font-medium italic text-center py-4 bg-gray-50/50 border border-dashed border-gray-100 rounded-2xl">
                        Aucun commentaire. Soyez le premier à commenter !
                      </p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 items-end pt-1">
                    <input
                      type="text"
                      placeholder="Ajouter un commentaire..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#534AB7] focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#534AB7] text-white hover:bg-[#453da3] rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
                    >
                      <Send className="size-4" />
                    </button>
                  </form>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-gray-100 bg-gray-55/50 flex gap-3">
                <button
                  onClick={handleSavePostDetails}
                  className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#453da3] text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-97 text-center shadow-sm"
                >
                  Enregistrer les modifications
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer ce post définitivement ?")) {
                      handleDeletePost(editingPost.id)
                      setEditingPost(null)
                    }
                  }}
                  className="p-2.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl text-xs font-bold border border-red-100 transition-all cursor-pointer"
                  title="Supprimer le post"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )

  // Drag and drop helper inside Kanban columns
  function handleBulkChangeStatusOfDragged(status: PostItem['status']) {
    const draggedId = (window as any)._draggedPostId
    if (draggedId) {
      handleUpdateStatus(draggedId, status)
      ;(window as any)._draggedPostId = null
    }
  }

  // Check if post corresponds to cellDate
  function isPostDueOnDate(post: PostItem, cellDate: Date) {
    const parsed = parsePostDate(post.dueDate)
    if (!parsed) return false
    return parsed.getDate() === cellDate.getDate() &&
           parsed.getMonth() === cellDate.getMonth() &&
           parsed.getFullYear() === cellDate.getFullYear()
  }
}

// Sub-Component: PostRow for list layout
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
  onUpdateStatus: (id: string, nextStatus: PostItem['status']) => void
  onDeletePost: (id: string) => void
  onEditPost: (post: PostItem) => void
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

  return (
    <div 
      onClick={() => onEditPost(post)}
      className={`flex items-center py-3.5 px-4 hover:bg-gray-50/70 transition-colors gap-4 cursor-pointer select-none ${
        selected ? 'bg-purple-50/20' : ''
      }`}
    >
      {/* Checkbox */}
      <div className="flex shrink-0" onClick={e => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={selected}
          onChange={() => onToggleSelect(post.id)}
          className="size-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]/40 cursor-pointer" 
        />
      </div>

      {/* Post Thumbnail & Title */}
      <div className="flex items-center gap-3 flex-1 min-w-[200px]">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="size-10 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
        />
        <div className="min-w-0">
          <div className="font-extrabold text-gray-900 text-xs sm:text-sm truncate hover:text-[#534AB7] transition-colors">
            {post.title}
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {post.category}
          </div>
        </div>
      </div>

      {/* Assigned User */}
      <div className="w-28 shrink-0 hidden sm:flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <img 
          src={getMemberAvatar(post.assigneeName)} 
          alt={post.assigneeName} 
          className="size-6 rounded-full border border-gray-100 shrink-0 object-cover" 
        />
        <span className="text-xs font-bold text-gray-700">{post.assigneeName}</span>
      </div>

      {/* Status Badge */}
      <div className="w-24 shrink-0">
        <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusStyles[post.status]}`}>
          {statusLabels[post.status]}
        </span>
      </div>

      {/* Due Date */}
      <div className="w-28 shrink-0 hidden md:block text-xs font-bold text-gray-500">
        {post.dueDate}
      </div>

      {/* Platforms */}
      <div className="w-24 shrink-0 flex items-center gap-1.5">
        {post.platforms.map(plat => (
          <span key={plat}>{renderPlatformIcon(plat)}</span>
        ))}
      </div>

      {/* Comments */}
      <div className="w-16 shrink-0 flex items-center gap-1 text-gray-400 font-extrabold text-xs">
        <MessageSquare className="size-3.5" />
        <span>{post.commentCount}</span>
      </div>

      {/* Actions (Dropdown Menu) */}
      <div className="w-10 shrink-0 text-right relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setActiveDropdownId(isDropdownOpen ? null : post.id)
          }}
          className="p-1 rounded-lg hover:bg-gray-150 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <MoreVertical className="size-4" />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setActiveDropdownId(null)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 text-left"
              >
                <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  Changer le statut
                </div>
                {post.status !== 'todo' && (
                  <button
                    onClick={() => onUpdateStatus(post.id, 'todo')}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                    À faire
                  </button>
                )}
                {post.status !== 'inprogress' && (
                  <button
                    onClick={() => onUpdateStatus(post.id, 'inprogress')}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                    En cours
                  </button>
                )}
                {post.status !== 'done' && (
                  <button
                    onClick={() => onUpdateStatus(post.id, 'done')}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                    Terminé
                  </button>
                )}
                <div className="border-t border-gray-50 my-1" />
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
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

// Sub-Component: KanbanCard for Kanban layout
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      draggable
      onDragStart={() => {
        ;(window as any)._draggedPostId = post.id
      }}
      onClick={() => onEdit(post)}
      className="bg-white border border-gray-150/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-purple-250 transition-all cursor-grab active:cursor-grabbing space-y-3.5 select-none relative group"
    >
      
      {/* Category & Menu */}
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-extrabold uppercase bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded-md">
          {post.category}
        </span>
        
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-650 cursor-pointer"
          >
            <MoreVertical className="size-3.5" />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 text-left"
                >
                  <button 
                    onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    Supprimer
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 leading-snug group-hover:text-[#534AB7] transition-colors">
        {post.title}
      </h4>

      {/* Cover Image (if present) */}
      {post.imageUrl && (
        <div className="h-28 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Card Footer Info */}
      <div className="flex justify-between items-center pt-1.5 border-t border-gray-50/60">
        
        {/* Platforms & Comments */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {post.platforms.slice(0, 3).map(plat => (
              <span key={plat} className="scale-90">{renderPlatformIcon(plat)}</span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 text-gray-400 font-extrabold text-[10px]">
            <MessageSquare className="size-3" />
            <span>{post.commentCount}</span>
          </div>
        </div>

        {/* Due Date & Assignee Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
            <Clock className="size-3" />
            {post.dueDate.replace(/\s*\d{4}$/, '') /* remove year for space */}
          </span>
          <img 
            src={getMemberAvatar(post.assigneeName)} 
            alt={post.assigneeName} 
            className="size-5 rounded-full border border-white shadow-sm shrink-0 object-cover" 
          />
        </div>

      </div>

    </div>
  )
}
