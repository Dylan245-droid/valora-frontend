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
        <div className="group relative h-full">
            <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-indigo-200/80 via-white to-amber-200/70 opacity-70 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.35rem] bg-white/80 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] group-hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)] group-hover:-translate-y-1 transition-all duration-300 h-full">
                
                {/* Trendy Top Gradient Line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.gradient}`} />

                <div className="p-6">
                    {/* Header: User & Date */}
                    <div className="flex justify-between items-start mb-4 gap-3">
                         <div className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-gray-200 via-white to-gray-200 opacity-90" />
                                <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-sm font-extrabold text-gray-600 shadow-inner overflow-hidden">
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
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Demandeur</p>
                                <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{request.user?.fullName}</p>
                                <div className="flex flex-col mt-0.5">
                                    <span className="text-[10px] text-gray-500 font-medium truncate">
                                        {request.user?.department?.entity?.name || '-'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate">
                                        {request.user?.department?.name || '-'}
                                    </span>
                                </div>
                            </div>
                         </div>
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} shadow-sm`}> 
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/5 text-[10px] leading-none">{config.icon}</span>
                            {getStatusLabel(request.status)}
                         </span>
                    </div>

                    {/* Content: Title & Amount */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between gap-2 mb-3">
                             <div className="flex items-center gap-1.5 min-w-0">
                                 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider
                                    ${request.stage === 'NEED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                      request.stage === 'SOURCING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                      request.stage === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                      'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                    {getStageLabel(request.stage)}
                                 </span>

                             </div>
                             <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                                {format(new Date(request.createdAt), 'd MMM yyyy', { locale: fr })}
                             </span>
                        </div>

                        <h3 onClick={() => onView(request.id)} className="text-[17px] font-black text-gray-900 mb-3 line-clamp-2 cursor-pointer group-hover:text-indigo-600 transition-colors leading-snug">
                            {request.title}
                        </h3>
                        
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-gray-50/80 to-white border border-gray-100 px-3 py-2 shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant estimé</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                                        {formatCurrency(request.totalEstimatedAmount || 0).replace('FCFA', '').trim()}
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-400">FCFA</span>
                                </div>
                            </div>
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm flex items-center justify-center text-white font-black text-sm`}> 
                                {config.icon}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Glassy) */}
                <div className="mt-auto border-t border-white/60 bg-white/60 p-4 backdrop-blur-xl flex items-center justify-between gap-2">
                     <button 
                        onClick={() => onView(request.id)}
                        className="flex-1 rounded-xl bg-white/80 border border-gray-200/70 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-white hover:text-indigo-700 hover:border-indigo-200 transition-all"
                     >
                        Détails
                     </button>

                     {/* Manager can process requests, but NOT their own */}
                     {currentUserRole === 'MANAGER' && request.status === 'PENDING' && request.userId !== currentUserId && (
                         <button onClick={() => onAction(request.id, 'PROCESSING')} className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200/60 hover:bg-indigo-700 transition-all">
                            Traiter
                         </button>
                     )}

                      {/* Manager can validate PROCESSING requests, but NOT their own */}
                      {currentUserRole === 'MANAGER' && request.status === 'PROCESSING' && request.userId !== currentUserId && (
                         (() => {
                            const hasApproved = request.requestApprovals?.some(ra => ra.approverId === currentUserId && ra.status === 'APPROVED')
                            
                            if (hasApproved) {
                                return (
                                    <div className="flex-1 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        En attente des autres
                                    </div>
                                )
                            }

                            return (
                                 <div className="flex gap-2 flex-1">
                                    <button onClick={() => onAction(request.id, 'APPROVED')} className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-white shadow-md shadow-emerald-200/60 hover:bg-emerald-600 transition-all flex justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                    <button onClick={() => onAction(request.id, 'REJECTED')} className="flex-1 rounded-xl bg-white/80 border border-rose-200 text-rose-600 px-3 py-2 hover:bg-rose-50 transition-all flex justify-center shadow-sm">
                                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                 </div>
                            )
                         })()
                     )}

                     {currentUserRole === 'EMPLOYEE' && request.status === 'PENDING' && request.stage === 'NEED' && (
                         <button onClick={() => onEdit(request.id)} className="flex-1 rounded-xl bg-white/80 border border-gray-200/70 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-white hover:text-orange-600 transition-all">
                            Modifier
                         </button>
                     )}
                </div>
            </div>
        </div>
    )
}
