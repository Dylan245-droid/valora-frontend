import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequestDetailModal from '../components/RequestDetailModal'
import RejectionModal from '../components/RejectionModal'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { type PurchaseRequest } from '../types/request'
import toast from 'react-hot-toast'
import { formatCurrency } from '../utils/formatting'
import { Button } from '../components/ui/Button'
import { StatsCard } from '../components/ui/StatsCard'
import RequestCard from '../components/ui/RequestCard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import RequestTable from '../components/ui/RequestTable'
import RequestFilters from '../components/RequestFilters'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | undefined>(undefined)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [requestToReject, setRequestToReject] = useState<number | null>(null)

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [searchFilter, setSearchFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [activeTab, setActiveTab] = useState<'NEEDS' | 'ORDERS'>('NEEDS')

  // Filter Logic
  const filteredRequests = requests.filter(req => {
      // Tab Logic
      const isNeedStage = req.stage === 'NEED' || req.stage === 'SOURCING'
      const isOrderStage = req.stage === 'VALIDATION' || req.stage === 'PENDING_PAYMENT' || req.stage === 'INVOICED' || !req.stage // Default to validation/order if no stage defined (legacy)
      
      if (activeTab === 'NEEDS' && !isNeedStage) return false
      if (activeTab === 'ORDERS' && !isOrderStage) return false

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesDept = deptFilter === 'ALL' || req.user?.department?.name === deptFilter
      const matchesSearch = searchFilter === '' || 
                            req.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            req.user?.fullName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            // Check Validated By (Approvers)
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

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/purchase-requests')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch requests', error)
      toast.error('Impossible de charger les demandes')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (id: number) => {
      try {
          const response = await api.get(`/purchase-requests/${id}`)
          setSelectedRequest(response.data)
          setIsDetailOpen(true)
      } catch (error) {
          toast.error('Impossible de charger les détails de la demande')
      }
  }

  // Initial trigger for Manager actions
  const handleActionClick = (id: number, action: 'APPROVED' | 'REJECTED' | 'PROCESSING') => {
      if (action === 'REJECTED') {
          setRequestToReject(id)
          setIsRejectOpen(true)
      } else {
          handleValidation(id, action) // Direct call for others
      }
  }

  const confirmRejection = (reason: string) => {
      if (requestToReject) {
          handleValidation(requestToReject, 'REJECTED', reason)
          setIsRejectOpen(false)
          setRequestToReject(null)
      }
  }

  const handleValidation = async (id: number, status: 'APPROVED' | 'REJECTED' | 'PROCESSING', reason?: string) => {
    const action = status === 'PROCESSING' ? 'process' : status.toLowerCase()
    
    // Confirmation for non-rejection actions (Rejection logic is handled by Modal flow now)
    if (status !== 'REJECTED') {
         if (!confirm(`Êtes-vous sûr de vouloir ${action === 'process' ? 'traiter' : action === 'approved' ? 'valider' : 'rejeter'} cette demande ?`)) return
    }
    
    try {
        await api.patch(`/purchase-requests/${id}/status`, { status, reason })
        // Re-fetch individual request to get updated relations (approvals)
        const freshResponse = await api.get(`/purchase-requests/${id}`)
        const updatedRequest = freshResponse.data
        
        // Update state with actual server response (handles Partial Approval / PROCESSING)
        setRequests(requests.map(req => req.id === id ? updatedRequest : req))
        
        const finalStatus = updatedRequest.status
        const statusFr = finalStatus === 'APPROVED' ? 'validée' : finalStatus === 'REJECTED' ? 'rejetée' : 'en cours de traitement';
        toast.success(`Demande ${statusFr}`)
    } catch (error) {
        console.error(error)
        toast.error('Échec de la mise à jour du statut')
    }
  }

  // Calculate Metrics
  const totalSpent = requests
    .filter(r => r.status === 'APPROVED')
    .reduce((acc, curr) => acc + Number(curr.totalEstimatedAmount), 0)
  
  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Enterprise Header - Cleaner, Professional */}
      <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12" />
          <div className="relative z-10">
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Bonjour, {user?.fullName?.split(' ')[0]} 👋
               </h1>
               <p className="mt-2 text-gray-500 font-medium">
                  Voici l'aperçu de vos activités pour le {format(new Date(), 'd MMMM yyyy', { locale: fr })}.
               </p>
          </div>
          {user?.role !== 'ADMIN' && (
              <Button onClick={() => navigate('/create-request')} className="relative z-10 rounded-xl px-6 py-6 shadow-xl shadow-indigo-500/20 bg-indigo-600 text-[15px] font-bold hover:scale-105 active:scale-95 transition-all">
                  <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" strokeWidth={3}>
                         <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Nouvelle Expression de Besoin
                  </span>
              </Button>
          )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Dépenses Validées" 
            value={formatCurrency(totalSpent)} 
            color="indigo"
            icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
        />
        <StatsCard 
            title="En Attente" 
            value={pendingCount.toString()} 
            color="amber"
            icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            }
        />
         <StatsCard 
            title="Procurement (Besoin)" 
            value={requests.filter(r => r.stage === 'NEED').length.toString()} 
            color="indigo"
            icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
            }
        />
        <StatsCard 
            title="Approuvées" 
            value={approvedCount.toString()} 
            color="emerald"
            icon={
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center pt-4">
          <div className="flex space-x-1 rounded-full bg-white p-1 hover:shadow-lg hover:shadow-gray-200/50 transition-all border border-gray-100 max-w-xl w-full shadow-sm">
              <button
                  onClick={() => setActiveTab('NEEDS')}
                  className={`flex-1 rounded-full py-3 px-6 text-sm font-bold transition-all duration-300 relative
                    ${activeTab === 'NEEDS' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
              >
                  Besoins & Sourcing
                  {requests.filter(r => r.stage === 'NEED' || r.stage === 'SOURCING').length > 0 && (
                      <span className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] 
                        ${activeTab === 'NEEDS' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                          {requests.filter(r => r.stage === 'NEED' || r.stage === 'SOURCING').length}
                      </span>
                  )}
              </button>
              <button
                  onClick={() => setActiveTab('ORDERS')}
                  className={`flex-1 rounded-full py-3 px-6 text-sm font-bold transition-all duration-300 relative
                    ${activeTab === 'ORDERS' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
              >
                  Suivi Validations
                  {requests.filter(r => r.stage === 'VALIDATION' || r.stage === 'PENDING_PAYMENT' || r.stage === 'INVOICED' || !r.stage).length > 0 && (
                      <span className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] 
                        ${activeTab === 'ORDERS' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                          {requests.filter(r => r.stage === 'VALIDATION' || r.stage === 'PENDING_PAYMENT' || r.stage === 'INVOICED' || !r.stage).length}
                      </span>
                  )}
              </button>
          </div>
      </div>

      {/* Requests List (Cards/Table) */}
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
              departments={Array.from(new Set(requests.map(r => r.user?.department?.name).filter((d): d is string => !!d)))}
              requestsToExport={filteredRequests}
              showDeptFilter={true}
          />
            
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>)}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center shadow-sm mb-4">
                   <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Aucune demande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Essayez de modifier vos filtres ou créez une nouvelle demande.</p>
              {requests.length === 0 && (
                  <div className="mt-8">
                      <Button onClick={() => navigate('/create-request')}>Créer ma première demande</Button>
                  </div>
              )}
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
                          onAction={handleActionClick}
                          onEdit={(id) => navigate(`/edit-request/${id}`)}
                      />
                  ))}
                </div>
            ) : (
                <RequestTable 
                    requests={filteredRequests}
                    currentUserRole={user?.role}
                    currentUserId={user?.id}
                    onView={handleView}
                    onAction={handleActionClick}
                    onEdit={(id) => navigate(`/edit-request/${id}`)}
                />
            )
          )}
      </div>

      <RequestDetailModal  
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        request={selectedRequest}
      />

      <RejectionModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={confirmRejection}
      />
    </div>
  )
}
