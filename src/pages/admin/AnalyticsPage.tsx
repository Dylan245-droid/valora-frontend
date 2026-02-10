import { useState, useEffect } from 'react'
import api from '../../api/client'
import { StatsCard } from '../../components/ui/StatsCard'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { type PurchaseRequest } from '../../types/request'
import RequestCard from '../../components/ui/RequestCard'
import RequestDetailModal from '../../components/RequestDetailModal'
import { useAuth } from '../../context/AuthContext'
import RequestTable from '../../components/ui/RequestTable'
import RequestFilters from '../../components/RequestFilters'
import { StatusDistributionChart, DailyActivityChart } from '../../components/analytics/AnalyticsCharts'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState<any>(null)
    const [requests, setRequests] = useState<PurchaseRequest[]>([])
    const [loading, setLoading] = useState(true)
    
    // Request List State
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | undefined>(undefined)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Filters State
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [deptFilter, setDeptFilter] = useState('ALL')
    const [searchFilter, setSearchFilter] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, requestsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/purchase-requests')
                ])
                setStats(statsRes.data)
                setRequests(requestsRes.data)
            } catch (error) {
                console.error('Failed to fetch data', error)
                toast.error('Erreur lors du chargement des données')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
        const matchesDept = deptFilter === 'ALL' || req.user?.department?.name === deptFilter
        const matchesSearch = searchFilter === '' || 
                              req.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              req.user?.fullName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              req.requestApprovals?.some(approval => approval.approver?.fullName.toLowerCase().includes(searchFilter.toLowerCase()))
        
        let matchesDate = true
        if (dateStart) {
            matchesDate = matchesDate && new Date(req.createdAt) >= new Date(dateStart)
        }
        if (dateEnd) {
             const end = new Date(dateEnd)
             end.setHours(23, 59, 59, 999)
             matchesDate = matchesDate && new Date(req.createdAt) <= end
        }

        return matchesStatus && matchesDept && matchesSearch && matchesDate
    })

    const handleView = async (id: number) => {
        try {
            const response = await api.get(`/purchase-requests/${id}`)
            setSelectedRequest(response.data)
            setIsDetailOpen(true)
        } catch (error) {
            toast.error('Impossible de charger les détails')
        }
    }

    // Admin dummy action (Admins currently verify via detail modal mostly, but we keep the prop clean)
    const handleValidation = async (id: number, status: 'APPROVED' | 'REJECTED' | 'PROCESSING') => {
        let reason = ''
        
        if (status === 'REJECTED') {
             const input = window.prompt("Veuillez indiquer le motif du rejet :")
             if (input === null) return // User cancelled
             reason = input
        } else {
             const action = status === 'PROCESSING' ? 'traiter' : 'valider'
             if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cette demande ?`)) return
        }

        try {
            await api.patch(`/purchase-requests/${id}/status`, { status, reason })
            
            // Refresh Data to keep stats in sync
            const [statsRes, requestsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/purchase-requests')
            ])
            setStats(statsRes.data)
            setRequests(requestsRes.data)

            // Update modal if open
            if (selectedRequest && selectedRequest.id === id) {
                 const updated = requestsRes.data.find((r: any) => r.id === id)
                 if (updated) setSelectedRequest(updated)
            }

            toast.success(`Demande ${status === 'APPROVED' ? 'validée' : status === 'REJECTED' ? 'rejetée' : 'en cours de traitement'}`)
        } catch (error) {
            console.error('Action failed', error)
            toast.error("Erreur lors de la mise à jour")
        }
    }

    if (loading) return <div className="p-8"><div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div></div>

    // Helper to get count by status safely
    const getCount = (status: string) => {
        const item = stats?.byStatus.find((s: any) => s.status === status)
        return item ? parseInt(item.count) : 0
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="!p-2 -ml-2 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de Bord Analytique</h1>
                    <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des performances et des demandes en cours.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Total Demandes" 
                    value={stats?.total || '0'} 
                    color="indigo"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <StatsCard 
                    title="En Attente" 
                    value={getCount('PENDING').toString()} 
                    color="amber"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatsCard 
                    title="En Traitement" 
                    value={getCount('PROCESSING').toString()} 
                    color="blue"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatsCard 
                    title="Approuvées" 
                    value={getCount('APPROVED').toString()} 
                    color="emerald"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6">Activité des 7 derniers jours</h3>
                    {/* Dynamic import or direct usage if possible. Direct usage is fine since we are in SPA */}
                    <DailyActivityChart requests={requests} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6">État des Demandes</h3>
                    <StatusDistributionChart requests={requests} />
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Répartition par Département</h3>
                    <div className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        Total: {stats?.byDepartment?.length || 0} Services
                    </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {/* List Header */}
                    <div className="grid grid-cols-12 px-8 py-3 bg-gray-50/30 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Département</div>
                        <div className="col-span-2 text-right">Demandes</div>
                        <div className="col-span-4 text-left pl-6">Volume</div>
                    </div>

                    {/* Rows */}
                    {stats?.byDepartment && stats.byDepartment.length > 0 ? (
                        stats.byDepartment.map((dept: any, index: number) => {
                            const count = parseInt(dept.count)
                            const total = parseInt(stats.total)
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                            const colors = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700']
                            const colorClass = colors[index % colors.length]
                            
                            return (
                                <div key={index} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors group">
                                    <div className="col-span-1 text-gray-400 text-xs font-semibold group-hover:text-indigo-500">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="col-span-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${colorClass}`}>
                                                {dept.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900">{dept.name}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{count}</span>
                                    </div>
                                    <div className="col-span-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity relative" 
                                                    style={{ width: `${percentage}%` }}
                                                >
                                                     {/* Shimmer effect */}
                                                     <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 w-10 text-right">{percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                         <div className="px-8 py-12 text-center">
                           <p className="text-sm font-medium text-gray-500">Aucune donnée départementale.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Requests Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Demandes récentes</h2>
                </div>

                <div className="space-y-6">
                     <RequestFilters 
                        onSearchChange={setSearchFilter}
                        onStatusChange={setStatusFilter}
                        onDeptChange={setDeptFilter}
                        onDateRangeChange={(start, end) => {
                            setDateStart(start)
                            setDateEnd(end)
                        }}
                        onViewChange={setViewMode}
                        viewMode={viewMode}
                        departments={stats?.byDepartment?.map((d: any) => d.name) || Array.from(new Set(requests.map(r => r.user?.department?.name).filter((d): d is string => !!d)))}
                        requestsToExport={filteredRequests}
                        showDeptFilter={true}
                    />

                    {filteredRequests.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                             <p className="text-gray-500">Aucune demande ne correspond aux filtres.</p>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                                {filteredRequests.map((request) => (
                                    <RequestCard 
                                        key={request.id}
                                        request={request}
                                        currentUserRole={user?.role}
                                        currentUserId={user?.id}
                                        onView={handleView}
                                        onAction={handleValidation}
                                        onEdit={() => {}} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <RequestTable 
                                requests={filteredRequests}
                                currentUserRole={user?.role}
                                currentUserId={user?.id}
                                onView={handleView}
                                onAction={handleValidation}
                                onEdit={() => {}}
                            />
                        )
                    )}
                </div>
            </div>

            <RequestDetailModal  
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                request={selectedRequest}
            />
        </div>
    )
}
