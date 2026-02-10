import { useEffect, useState, type ChangeEvent } from 'react'
import { 
    getAnalyticalCatalogs, 
    getAnalyticalProjects, 
    getAnalyticalActivities,
    getAnalyticalCodes,
    type AnalyticalCatalog,
    type AnalyticalProject,
    type AnalyticalActivity,
    type AnalyticalCode 
} from '../api/analytical'
import toast from 'react-hot-toast'

interface AnalyticalSelectorProps {
    onCodeSelect: (codeId: number | null) => void
    disabled?: boolean
    initialAnalyticalCode?: AnalyticalCode
}

export default function AnalyticalSelector({ onCodeSelect, disabled = false, initialAnalyticalCode }: AnalyticalSelectorProps) {
    const [catalogs, setCatalogs] = useState<AnalyticalCatalog[]>([])
    const [projects, setProjects] = useState<AnalyticalProject[]>([])
    const [activities, setActivities] = useState<AnalyticalActivity[]>([])
    const [codes, setCodes] = useState<AnalyticalCode[]>([])

    // ... (rest of state stays same) ...
    // Use '' for empty selection to satisfy React controlled component (value cannot be null)
    const [selectedCatalog, setSelectedCatalog] = useState<number | ''>('')
    const [selectedProject, setSelectedProject] = useState<number | ''>('')
    const [selectedActivity, setSelectedActivity] = useState<number | ''>('')
    const [selectedCode, setSelectedCode] = useState<number | ''>('')

    const [loadingCatalogs, setLoadingCatalogs] = useState(false)
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [loadingActivities, setLoadingActivities] = useState(false)
    const [loadingCodes, setLoadingCodes] = useState(false)

    // Load Catalogs on mount
    useEffect(() => {
        let mounted = true
        const loadCatalogs = async () => {
            setLoadingCatalogs(true)
            try {
                const data = await getAnalyticalCatalogs()
                if (mounted) {
                    setCatalogs(data)
                    // Pre-select if initial data exists
                    if (initialAnalyticalCode) {
                         if (initialAnalyticalCode.activity?.project?.catalog?.id) {
                            setSelectedCatalog(initialAnalyticalCode.activity.project.catalog.id)
                        } else if (initialAnalyticalCode.project?.catalog?.id) {
                            // Legacy fallback
                            setSelectedCatalog(initialAnalyticalCode.project.catalog.id)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load catalogs', error)
                toast.error('Impossible de charger les codes généraux')
            } finally {
                if (mounted) setLoadingCatalogs(false)
            }
        }
        loadCatalogs()
        return () => { mounted = false }
    }, [initialAnalyticalCode])

    // Load Projects when Catalog changes
    useEffect(() => {
        let mounted = true
        if (selectedCatalog !== '') {
            const loadProjects = async () => {
                setLoadingProjects(true)
                // Reset dependent fields immediately
                setProjects([])
                setSelectedProject('')
                setActivities([])
                setSelectedActivity('')
                setCodes([])
                setSelectedCode('')
                onCodeSelect(null)
                
                try {
                    const data = await getAnalyticalProjects(selectedCatalog as number)
                    if (mounted) {
                        setProjects(data)
                         // Pre-select project
                         if (initialAnalyticalCode && selectedCatalog === (initialAnalyticalCode.activity?.project?.catalog?.id || initialAnalyticalCode.project?.catalog?.id)) {
                             const targetProjectId = initialAnalyticalCode.activity?.projectId || initialAnalyticalCode.projectId
                             if (targetProjectId) setSelectedProject(targetProjectId)
                        }
                    }
                } catch (error) {
                    console.error(error)
                    toast.error('Erreur chargement des codes spécifiques')
                } finally {
                    if (mounted) setLoadingProjects(false)
                }
            }
            loadProjects()
        } else {
            // ... (rest of else block) ...
            setProjects([])
            setSelectedProject('')
            setActivities([])
            setSelectedActivity('')
            setCodes([])
            setSelectedCode('')
            onCodeSelect(null)
        }
        return () => { mounted = false }
    }, [selectedCatalog, initialAnalyticalCode]) // Added initialAnalyticalCode dependency

    // Load Activities when Project changes
    useEffect(() => {
        let mounted = true
        if (selectedProject !== '') {
            const loadActivities = async () => {
                setLoadingActivities(true)
                // Reset dependent
                setActivities([])
                setSelectedActivity('')
                setCodes([])
                setSelectedCode('')
                onCodeSelect(null)

                try {
                    const data = await getAnalyticalActivities(selectedProject as number)
                    if (mounted) {
                        setActivities(data)
                        // Pre-select activity
                        if (initialAnalyticalCode && initialAnalyticalCode.activityId && selectedProject === initialAnalyticalCode.activity?.projectId) {
                            setSelectedActivity(initialAnalyticalCode.activityId)
                        }
                    }
                } catch (error) {
                    console.error(error)
                    toast.error('Erreur chargement des codes départements')
                } finally {
                    if (mounted) setLoadingActivities(false)
                }
            }
            loadActivities()
        } else {
             // ... (reset logic) ...
            setActivities([])
            setSelectedActivity('')
            setCodes([])
            setSelectedCode('')
            onCodeSelect(null)
        }
        return () => { mounted = false }
    }, [selectedProject, initialAnalyticalCode])

    // Load Codes when Activity changes
    useEffect(() => {
        let mounted = true
        if (selectedActivity !== '') {
            const loadCodes = async () => {
                setLoadingCodes(true)
                // Reset dependent
                setCodes([])
                setSelectedCode('') 
                onCodeSelect(null)

                try {
                    const data = await getAnalyticalCodes(selectedActivity as number)
                    if (mounted) {
                        setCodes(data)
                         // Pre-select code
                        if (initialAnalyticalCode && initialAnalyticalCode.id && selectedActivity === initialAnalyticalCode.activityId) {
                            setSelectedCode(initialAnalyticalCode.id)
                            onCodeSelect(initialAnalyticalCode.id)
                        }
                    }
                } catch (error) {
                    console.error(error)
                    toast.error('Erreur chargement des codes identitaires')
                } finally {
                    if (mounted) setLoadingCodes(false)
                }
            }
            loadCodes()
        } else {
             // ... (reset logic) ...
            setCodes([])
            setSelectedCode('')
            onCodeSelect(null)
        }
        return () => { mounted = false }
    }, [selectedActivity, initialAnalyticalCode])

    const handleCatalogChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedCatalog(val ? Number(val) : '')
    }

    const handleProjectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedProject(val ? Number(val) : '')
    }

    const handleActivityChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedActivity(val ? Number(val) : '')
    }

    const handleCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const numVal = val ? Number(val) : ''
        setSelectedCode(numVal)
        onCodeSelect(numVal === '' ? null : numVal)
    }

    const selectClass = "block w-full rounded-xl border-gray-200 py-2.5 px-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50/50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    const labelClass = "block text-sm font-medium text-gray-700 mb-1"

    if (catalogs.length === 0 && !loadingCatalogs) {
        return null 
    }

    return (
        <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-dashed border-indigo-100">
            <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                 </div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Imputation Analytique</h4>
                 <div className="group relative flex items-center">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        Sélectionnez ici le budget sur lequel cette dépense sera imputée (Code Général, Spécifique, Département et Identitaire).
                    </div>
                 </div>
            </div>
            <p className="text-[11px] text-gray-500 ml-8 leading-tight">
                Ces informations sont nécessaires pour le suivi budgétaire.
            </p>

            {/* Catalog Select */}
            <div>
                <label className={labelClass}>1. Code Général (L1)</label>
                <div className="relative">
                    <select
                        value={selectedCatalog ?? ""}
                        onChange={handleCatalogChange}
                        disabled={disabled || loadingCatalogs}
                        className={selectClass}
                    >
                        <option value="">Sélectionner un code général...</option>
                        {catalogs.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} {cat.code ? `(${cat.code})` : ''}
                            </option>
                        ))}
                    </select>
                    {loadingCatalogs && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Select */}
            <div>
                <label className={labelClass}>2. Code Spécifique (L2)</label>
                <div className="relative">
                    <select
                        value={selectedProject ?? ""}
                        onChange={handleProjectChange}
                        disabled={disabled || selectedCatalog === '' || loadingProjects}
                        className={selectClass}
                    >
                        <option value="">Sélectionner un code spécifique...</option>
                        {projects.map(prj => (
                            <option key={prj.id} value={prj.id}>
                                {prj.name} {prj.code ? `(${prj.code})` : ''}
                            </option>
                        ))}
                    </select>
                    {loadingProjects && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Select (NEW L3) */}
            <div>
                <label className={labelClass}>3. Code Département (L3)</label>
                <div className="relative">
                    <select
                        value={selectedActivity ?? ""}
                        onChange={handleActivityChange}
                        disabled={disabled || selectedProject === '' || loadingActivities}
                        className={selectClass}
                    >
                        <option value="">Sélectionner un code département...</option>
                        {activities.map(act => (
                            <option key={act.id} value={act.id}>
                                {act.name} ({act.code})
                            </option>
                        ))}
                    </select>
                    {loadingActivities && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Code Select */}
            <div>
                <label className={labelClass}>4. Code Identitaire (L4)</label>
                <div className="relative">
                    <select
                        value={selectedCode ?? ""}
                        onChange={handleCodeChange}
                        disabled={disabled || selectedActivity === '' || loadingCodes}
                        className={selectClass}
                        required
                    >
                        <option value="">Sélectionner un code identitaire...</option>
                        {codes.map(code => (
                            <option key={code.id} value={code.id}>
                                {code.code} {code.label ? `- ${code.label}` : ''}
                            </option>
                        ))}
                    </select>
                     {loadingCodes && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
