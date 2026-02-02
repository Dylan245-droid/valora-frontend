import { type PurchaseRequest } from '../../types/request'
import { formatCurrency, getStatusLabel, getStageLabel } from '../../utils/formatting'
import { getStorageUrl } from '../../utils/config'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RequestCardProps {
    request: PurchaseRequest
    currentUserRole: string | undefined
    currentUserId: number | undefined
    onView: (id: number) => void
    onAction: (id: number, action: 'APPROVED' | 'REJECTED' | 'PROCESSING') => void
    onEdit: (id: number) => void
}

export default function RequestCard({ request, currentUserRole, currentUserId, onView, onAction, onEdit }: RequestCardProps) {
    const statusConfig: Record<string, { bg: string, text: string, border: string, icon: string, gradient: string }> = {
        APPROVED: { 
            bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', 
            icon: '✓', gradient: 'from-emerald-400 to-emerald-600'
        },
        REJECTED: { 
            bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', 
            icon: '✕', gradient: 'from-rose-400 to-rose-600' 
        },
        PROCESSING: { 
            bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', 
            icon: '↻', gradient: 'from-blue-400 to-blue-600'
        },
        PENDING: { 
            bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', 
            icon: '!', gradient: 'from-amber-400 to-amber-600'
        }
    }

    const config = statusConfig[request.status] || statusConfig.PENDING

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 h-full">
            
            {/* Trendy Top Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.gradient}`} />

            <div className="p-6">
                {/* Header: User & Date */}
                <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shadow-inner overflow-hidden`}>
                             {request.user?.avatarUrl ? (
                                 <img 
                                    src={getStorageUrl(request.user.avatarUrl)} 
                                    alt={request.user.fullName || ''} 
                                    className="h-full w-full object-cover" 
                                 />
                             ) : (
                                 request.user?.fullName?.charAt(0) || 'U'
                             )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</p>
                            <p className="text-sm font-medium text-gray-900 leading-tight">{request.user?.fullName}</p>
                            <div className="flex flex-col mt-0.5">
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {request.user?.department?.entity?.name || '-'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {request.user?.department?.name || '-'}
                                </span>
                            </div>
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                        {getStatusLabel(request.status)}
                     </span>
                </div>

                {/* Content: Title & Amount */}
                <div className="mb-6">
                    <div className="flex items-center gap-1.5 mb-3">
                         <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border
                            ${request.stage === 'NEED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                              request.stage === 'SOURCING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                              request.stage === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {getStageLabel(request.stage)}
                         </span>
                         <span className="text-[10px] text-gray-400 font-medium">#{request.id}</span>
                    </div>

                    <h3 onClick={() => onView(request.id)} className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 cursor-pointer group-hover:text-indigo-600 transition-colors leading-tight">
                        {request.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 font-medium">
                        {format(new Date(request.createdAt), 'd MMMM yyyy', { locale: fr })}
                    </p>
                    
                    <div className="flex items-baseline gap-1 bg-gray-50/50 p-2 rounded-xl border border-gray-100 w-fit">
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                            {formatCurrency(request.totalEstimatedAmount || 0).replace('FCFA', '').trim()}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">FCFA</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions (Glassy) */}
            <div className="mt-auto border-t border-gray-50 bg-gray-50/50 p-4 backdrop-blur-sm flex items-center justify-between gap-2">
                 <button 
                    onClick={() => onView(request.id)}
                    className="flex-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                 >
                    Détails
                 </button>

                 {/* Manager can process requests, but NOT their own */}
                 {currentUserRole === 'MANAGER' && request.status === 'PENDING' && request.userId !== currentUserId && (
                     <button onClick={() => onAction(request.id, 'PROCESSING')} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all">
                        Traiter
                     </button>
                 )}

                  {/* Manager can validate PROCESSING requests, but NOT their own */}
                  {currentUserRole === 'MANAGER' && request.status === 'PROCESSING' && request.userId !== currentUserId && (
                     (() => {
                        const hasApproved = request.requestApprovals?.some(ra => ra.approverId === currentUserId && ra.status === 'APPROVED')
                        
                        if (hasApproved) {
                            return (
                                <div className="flex-1 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    En attente des autres
                                </div>
                            )
                        }

                        return (
                             <div className="flex gap-2 flex-1">
                                <button onClick={() => onAction(request.id, 'APPROVED')} className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-white shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all flex justify-center">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={() => onAction(request.id, 'REJECTED')} className="flex-1 rounded-lg bg-white border border-rose-200 text-rose-600 px-3 py-2 hover:bg-rose-50 transition-all flex justify-center">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                             </div>
                        )
                     })()
                 )}

                 {currentUserRole === 'EMPLOYEE' && request.status === 'PENDING' && request.stage === 'NEED' && (
                     <button onClick={() => onEdit(request.id)} className="flex-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-orange-600 transition-all">
                        Modifier
                     </button>
                 )}
            </div>
        </div>
    )
}
