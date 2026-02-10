import { useState, useEffect, useRef } from 'react'
import api from '../../api/client'
import { Button } from '../../components/ui/Button'
import { Plus, Trash2, Edit2, Link as LinkIcon, Save, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { TableScrollArea } from '../../components/ui/TableScrollArea'
import { 
    type AnalyticalCatalog, 
    type AnalyticalProject, 
    type AnalyticalActivity, 
    type AnalyticalCode 
} from '../../api/analytical'

interface Entity {
    id: number
    name: string
    code: string
    catalogs?: AnalyticalCatalog[]
}

export default function AnalyticalSettingsPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'catalogs' | 'projects' | 'activities' | 'codes'>('catalogs')
    const [stats, setStats] = useState({ catalogs: 0, projects: 0, activities: 0, codes: 0 })
    
    // Data States
    const [catalogs, setCatalogs] = useState<AnalyticalCatalog[]>([])
    const [entities, setEntities] = useState<Entity[]>([])
    const [projects, setProjects] = useState<AnalyticalProject[]>([])
    const [activities, setActivities] = useState<AnalyticalActivity[]>([])
    const [codes, setCodes] = useState<AnalyticalCode[]>([])

    // Loading States
    const [loading, setLoading] = useState(false)

    // Form States
    const [editingCatalog, setEditingCatalog] = useState<Partial<AnalyticalCatalog> | null>(null)
    const [editingProject, setEditingProject] = useState<Partial<AnalyticalProject> | null>(null)
    const [editingActivity, setEditingActivity] = useState<Partial<AnalyticalActivity> | null>(null)
    const [editingCode, setEditingCode] = useState<Partial<AnalyticalCode> | null>(null)

    // Filters
    const [selectedCatalogId, setSelectedCatalogId] = useState<number | ''>('')
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
    const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('')
    const [codeSearch, setCodeSearch] = useState('')

    // Import
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchStats()
        fetchCatalogs()
        if (activeTab === 'catalogs') fetchEntities()
    }, [activeTab])

    useEffect(() => {
        if (activeTab === 'projects') fetchProjects()
    }, [activeTab, selectedCatalogId])

    useEffect(() => {
        if (activeTab === 'activities') fetchActivities()
    }, [activeTab, selectedProjectId]) // Filter by project if selected

    useEffect(() => {
        if (activeTab === 'codes') fetchCodes()
    }, [activeTab, selectedActivityId, codeSearch])

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/analytical/stats')
            setStats(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchCatalogs = async () => {
        try {
            const res = await api.get('/admin/analytical/catalogs')
            setCatalogs(res.data)
        } catch (e) { toast.error('Erreur chargement des codes généraux') }
    }

    const fetchEntities = async () => {
        try {
            const res = await api.get('/entities')
            setEntities(res.data)
        } catch (e) { toast.error('Erreur chargement entités') }
    }

    const fetchProjects = async () => {
        try {
            const params: any = {}
            if (selectedCatalogId) params.catalogId = selectedCatalogId
            const res = await api.get('/admin/analytical/projects', { params })
            setProjects(res.data)
        } catch (e) { toast.error('Erreur chargement des codes spécifiques') }
    }

    const fetchActivities = async () => {
        try {
            const params: any = {}
            if (selectedProjectId) params.projectId = selectedProjectId
            const res = await api.get('/admin/analytical/activities', { params })
            setActivities(res.data)
        } catch (e) { toast.error('Erreur chargement des codes départements') }
    }

    const fetchCodes = async () => {
        try {
            setLoading(true)
            const params: any = {}
            if (selectedActivityId) params.activityId = selectedActivityId
            if (codeSearch) params.search = codeSearch
            const res = await api.get('/admin/analytical/codes', { params })
            setCodes(res.data)
        } catch (e) { toast.error('Erreur chargement des codes identitaires') }
        finally { setLoading(false) }
    }

    // --- IMPORT ---
    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const toastId = toast.loading('Importation en cours...')
        try {
            const res = await api.post('/admin/analytical/import-v5', formData)
            toast.success(res.data.message || 'Import réussi', { id: toastId })
            fetchStats()
            // Reset filters to see something maybe?
            setActiveTab('catalogs')
        } catch (error) {
            console.error(error)
            toast.error('Erreur lors de l\'import', { id: toastId })
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }


    // --- CRUD CATALOGS ---
    const handleSaveCatalog = async () => {
        if (!editingCatalog?.name) return toast.error('Nom requis')
        try {
            if (editingCatalog.id) {
                await api.put(`/admin/analytical/catalogs/${editingCatalog.id}`, editingCatalog)
                toast.success('Catalogue mis à jour')
            } else {
                await api.post('/admin/analytical/catalogs', editingCatalog)
                toast.success('Catalogue créé')
            }
            setEditingCatalog(null)
            fetchCatalogs()
            fetchStats()
        } catch (e) { toast.error('Erreur sauvegarde') }
    }

    const handleDeleteCatalog = async (id: number) => {
        if (!confirm('Supprimer ce catalogue ?')) return
        try {
            await api.delete(`/admin/analytical/catalogs/${id}`)
            toast.success('Catalogue supprimé')
            fetchCatalogs()
            fetchStats()
        } catch (e) { toast.error('Impossible de supprimer') }
    }

    const toggleEntityCatalog = async (entity: Entity, catalogId: number, isLinked: boolean) => {
        const currentCatalogIds = catalogs
            .filter(c => c.entities?.some(e => e.id === entity.id))
            .map(c => c.id)
        
        let newIds = []
        if (isLinked) {
            newIds = currentCatalogIds.filter(id => id !== catalogId)
        } else {
            newIds = [...currentCatalogIds, catalogId]
        }

        try {
            await api.post(`/admin/analytical/entities/${entity.id}/catalogs`, { catalogIds: newIds })
            toast.success('Liaison mise à jour')
            fetchCatalogs()
        } catch (e) { toast.error('Erreur liaison') }
    }

    // --- CRUD PROJECTS ---
    const handleSaveProject = async () => {
        if (!editingProject?.name || !editingProject?.catalogId) return toast.error('Nom et Catalogue requis')
        try {
            if (editingProject.id) {
                await api.put(`/admin/analytical/projects/${editingProject.id}`, editingProject)
                toast.success('Projet mis à jour')
            } else {
                await api.post('/admin/analytical/projects', editingProject)
                toast.success('Projet créé')
            }
            setEditingProject(null)
            fetchProjects()
            fetchStats()
        } catch (e) { toast.error('Erreur sauvegarde') }
    }

    // --- CRUD ACTIVITIES ---
    const handleSaveActivity = async () => {
        if (!editingActivity?.name || !editingActivity?.projectId || !editingActivity?.code) return toast.error('Nom, Code et Projet requis')
        try {
            // Check update or create
            // Currently API likely supports storeActivity, need update if implementing full CRUD
            // Assuming store exists. Update might be missing in routes but let's try post first or handling error
            await api.post('/admin/analytical/activities', editingActivity) // Minimal impl
            toast.success('Activité créée')
            
            setEditingActivity(null)
            fetchActivities()
            fetchStats()
        } catch (e) { toast.error('Erreur sauvegarde') }
    }
    
    // --- CRUD CODES ---
    const handleSaveCode = async () => {
        if (!editingCode?.code || !editingCode?.activityId) return toast.error('Code et Activité requis')
        try {
            if (editingCode.id) {
                await api.put(`/admin/analytical/codes/${editingCode.id}`, editingCode)
                toast.success('Code mis à jour')
            } else {
                await api.post('/admin/analytical/codes', editingCode)
                toast.success('Code créé')
            }
            setEditingCode(null)
            fetchCodes()
            fetchStats()
        } catch (e) { toast.error('Erreur sauvegarde') }
    }


    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="!p-2 -ml-2 text-gray-500 hover:text-gray-700 bg-white shadow-sm border border-gray-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres Analytiques (V5)</h1>
                    <p className="text-sm text-gray-500 mt-1">Gérez la structure analytique à 4 niveaux (Général &gt; Spécifique &gt; Département &gt; Identitaire).</p>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                    <Button onClick={handleImportClick} variant="outline" className="flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                        <Upload size={16} /> Import Master V5
                    </Button>

                    <div className="flex gap-4 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm ml-2">
                        <div className="flex items-center gap-2"><span className="text-indigo-600 font-bold">{stats.catalogs}</span> L1</div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2"><span className="text-indigo-600 font-bold">{stats.projects}</span> L2</div>
                        <div className="w-px h-4 bg-gray-200"></div>
                         <div className="flex items-center gap-2"><span className="text-indigo-600 font-bold">{stats.activities}</span> L3</div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2"><span className="text-indigo-600 font-bold">{stats.codes}</span> L4</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 w-fit">
                {(['catalogs', 'projects', 'activities', 'codes'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-4 py-2.5 text-sm font-medium leading-5 rounded-lg transition-all capitalize
                            ${activeTab === tab 
                                ? 'bg-white text-indigo-700 shadow shadow-gray-200' 
                                : 'text-gray-600 hover:bg-white/[0.6] hover:text-indigo-600'
                            }
                        `}
                    >
                        {tab === 'catalogs' && 'L1 - Code Général'}
                        {tab === 'projects' && 'L2 - Code Spécifique'}
                        {tab === 'activities' && 'L3 - Code Département'}
                        {tab === 'codes' && 'L4 - Code Identitaire'}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: CATALOGS */}
            {activeTab === 'catalogs' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={() => setEditingCatalog({ name: '', description: '' })} className="flex items-center gap-2">
                            <Plus size={16} /> Nouveau Code Général (L1)
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {catalogs.map(cat => (
                            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono bg-gray-100 px-1.5 rounded text-xs text-gray-600">{cat.code || 'N/A'}</span>
                                            <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingCatalog(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteCatalog(cat.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <LinkIcon size={12} /> Entités :
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {entities.map(ent => {
                                            const isLinked = cat.entities?.some(e => e.id === ent.id)
                                            return (
                                                <button 
                                                    key={ent.id}
                                                    onClick={() => toggleEntityCatalog(ent, cat.id, !!isLinked)}
                                                    className={`
                                                        px-2.5 py-1 rounded-md text-xs font-semibold border transition-all
                                                        ${isLinked 
                                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 hover:line-through' 
                                                            : 'bg-white border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-600'
                                                        }
                                                    `}
                                                >
                                                    {ent.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PROJECTS */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div className="w-full md:w-1/3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Filtrer par Code Général (L1)</label>
                            <select 
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500"
                                value={selectedCatalogId}
                                onChange={(e) => setSelectedCatalogId(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="">Tous les codes généraux</option>
                                {catalogs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={() => setEditingProject({ name: '', catalogId: selectedCatalogId || (catalogs[0]?.id || 0) })} className="flex items-center gap-2">
                            <Plus size={16} /> Nouveau Code Spécifique (L2)
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <TableScrollArea>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code Spécifique (L2)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parente (L1)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.map(proj => (
                                        <tr key={proj.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{proj.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{proj.code || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {proj.catalog?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => setEditingProject(proj)} className="text-indigo-600 hover:text-indigo-900 mx-2"><Edit2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableScrollArea>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: ACTIVITIES (L3) - NEW */}
            {activeTab === 'activities' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div className="w-full md:w-1/3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Filtrer par Code Spécifique (L2)</label>
                            <select 
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="">Tous les codes spécifiques</option>
                                {projects.length === 0 && <option disabled>Aucun code spécifique chargé</option>}
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={() => setEditingActivity({ name: '', projectId: selectedProjectId || (projects[0]?.id || 0) })} className="flex items-center gap-2">
                            <Plus size={16} /> Nouveau Code Département (L3)
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <TableScrollArea>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code Département (L3)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parente (L2)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activities.map(act => (
                                        <tr key={act.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{act.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{act.code || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {act.project?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Edit not fully implemented in backend yet but button stays */}
                                                <button className="text-gray-400 cursor-not-allowed mx-2" title="Modification non dispo"><Edit2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableScrollArea>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CODES */}
            {activeTab === 'codes' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Activité (L3)</label>
                            <select 
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500"
                                value={selectedActivityId}
                                onChange={(e) => {
                                    setSelectedActivityId(e.target.value ? Number(e.target.value) : '')
                                }}
                            >
                                <option value="">Toutes les activités</option>
                                {/* We rely on 'activities' state. User should select L1->L2->L3 ideally, but flattened list for now */}
                                {activities.length === 0 && <option disabled>Aucune activité chargée</option>}
                                {activities.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                            </select>
                        </div>
                   
                        <div className="flex items-end gap-2 md:col-span-2">
                             <input 
                                type="text" 
                                placeholder="Rechercher code L4 ou libellé..." 
                                className="flex-1 rounded-lg border-gray-200 text-sm focus:ring-indigo-500"
                                value={codeSearch}
                                onChange={(e) => setCodeSearch(e.target.value)}
                             />
                             <Button onClick={() => setEditingCode({ code: '', label: '', activityId: selectedActivityId || 0 })} disabled={!selectedActivityId} className="flex items-center gap-2 shrink-0">
                                <Plus size={16} /> Nouveau
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <TableScrollArea>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code Identitaire (L4)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parente (L3)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading && (
                                        <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500"><div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent mx-auto"></div></td></tr>
                                    )}
                                    {!loading && codes.map(code => (
                                        <tr key={code.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">{code.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{code.label || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-700">{code.activity?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => setEditingCode(code)} className="text-indigo-600 hover:text-indigo-900 mx-2"><Edit2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableScrollArea>
                    </div>
                </div>
            )}

            {/* MODALS (Simplified for brevity - kept main ones) */}
            
            {/* CATALOG MODAL */}
            {editingCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingCatalog.id ? 'Modifier' : 'Nouveau'} Catalogue</h3>
                            <button onClick={() => setEditingCatalog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code (L1)</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingCatalog.code || ''} onChange={(e) => setEditingCatalog({ ...editingCatalog, code: e.target.value })} placeholder="ex: 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingCatalog.name} onChange={(e) => setEditingCatalog({ ...editingCatalog, name: e.target.value })} />
                            </div>
                             <Button onClick={handleSaveCatalog} className="w-full flex justify-center gap-2">Enregistrer</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROJECT MODAL */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingProject.id ? 'Modifier' : 'Nouveau'} Projet</h3>
                            <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catalogue Parente (L1)</label>
                                <select className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingProject.catalogId} onChange={(e) => setEditingProject({ ...editingProject, catalogId: Number(e.target.value) })}>
                                    {catalogs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Projet</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code (L2)</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingProject.code || ''} onChange={(e) => setEditingProject({ ...editingProject, code: e.target.value })} placeholder="ex: 10" />
                            </div>
                            <Button onClick={handleSaveProject} className="w-full flex justify-center gap-2">Enregistrer</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVITY MODAL */}
             {editingActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Nouvelle Activité (L3)</h3>
                             <button onClick={() => setEditingActivity(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                         <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projet Parente (L2)</label>
                                <select className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingActivity.projectId} onChange={(e) => setEditingActivity({ ...editingActivity, projectId: Number(e.target.value) })}>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code L3</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingActivity.code || ''} onChange={(e) => setEditingActivity({ ...editingActivity, code: e.target.value })} placeholder="ex: 100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingActivity.name || ''} onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })} />
                            </div>
                            <Button onClick={handleSaveActivity} className="w-full flex justify-center gap-2">Enregistrer</Button>
                         </div>
                    </div>
                </div>
            )}

             {/* CODE MODAL */}
             {editingCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingCode.id ? 'Modifier' : 'Nouveau'} Code</h3>
                            <button onClick={() => setEditingCode(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Activité Parente (L3)</label>
                                <select className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingCode.activityId || ''} onChange={(e) => setEditingCode({ ...editingCode, activityId: Number(e.target.value) })}>
                                    {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code Identitaire (L4)</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 font-mono" value={editingCode.code} onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value })} placeholder="ex: 1001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                                <input type="text" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500" value={editingCode.label || ''} onChange={(e) => setEditingCode({ ...editingCode, label: e.target.value })} />
                            </div>
                            <Button onClick={handleSaveCode} className="w-full flex justify-center gap-2"><Save size={18}/> Enregistrer</Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
