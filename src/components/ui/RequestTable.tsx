import { type PurchaseRequest } from '../../types/request'
import { formatCurrency, getStageLabel, getStatusLabel } from '../../utils/formatting'
import { getStorageUrl } from '../../utils/config'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RequestTableProps {
    requests: PurchaseRequest[]
    currentUserRole: string | undefined
    currentUserId: number | undefined
    onView: (id: number) => void
    onAction: (id: number, action: 'APPROVED' | 'REJECTED' | 'PROCESSING') => void
    onEdit: (id: number) => void
}

export default function RequestTable({ requests, currentUserRole, currentUserId, onView, onAction, onEdit }: RequestTableProps) {
    
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Étape</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span 
                                        onClick={() => onView(request.id)}
                                        className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-indigo-600 transition-colors"
                                    >
                                        {request.title}
                                    </span>
                                    <span className="text-xs text-gray-400">#{request.id}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider
                                    ${request.stage === 'NEED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                      request.stage === 'SOURCING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                      request.stage === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                      'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                    {getStageLabel(request.stage)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 overflow-hidden">
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
                                    <div className="flex flex-col">
                                        <div className="text-sm font-medium text-gray-900">{request.user?.fullName}</div>
                                        <div className="text-xs text-gray-500">{request.user?.department?.name || 'N/A'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(request.createdAt), 'dd MMM yyyy', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                {formatCurrency(request.totalEstimatedAmount || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                    ${request.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 
                                      request.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' : 
                                      request.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : 
                                      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'}`}>
                                    {getStatusLabel(request.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => onView(request.id)}
                                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                                        title="Voir Détails"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>

                                    {/* Action Buttons for Manager - Cannot process own requests */}
                                    {currentUserRole === 'MANAGER' && request.status === 'PENDING' && request.userId !== currentUserId && (
                                        <button 
                                            onClick={() => onAction(request.id, 'PROCESSING')}
                                            className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                                            title="Traiter"
                                        >
                                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                           </svg>
                                        </button>
                                    )}

                                    {/* Cannot approve/reject own requests */}
                                    {currentUserRole === 'MANAGER' && request.status === 'PROCESSING' && request.userId !== currentUserId && (
                                        (() => {
                                           const hasApproved = request.requestApprovals?.some(ra => ra.approverId === currentUserId && ra.status === 'APPROVED')
                                           if (!hasApproved) {
                                               return (
                                                   <>
                                                       <button onClick={() => onAction(request.id, 'APPROVED')} className="text-emerald-400 hover:text-emerald-600 p-1" title="Approuver">
                                                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                       </button>
                                                       <button onClick={() => onAction(request.id, 'REJECTED')} className="text-rose-400 hover:text-rose-600 p-1" title="Rejeter">
                                                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                       </button>
                                                   </>
                                               )
                                           } else {
                                                return <span className="text-xs text-amber-500 font-medium italic p-1">En attente</span>
                                           }
                                        })()
                                    )}

                                    {/* Edit for Employee */}
                                    {currentUserRole === 'EMPLOYEE' && request.status === 'PENDING' && request.stage === 'NEED' && (
                                        <button 
                                            onClick={() => onEdit(request.id)}
                                            className="text-gray-400 hover:text-orange-600 transition-colors p-1"
                                            title="Modifier"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {requests.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                Aucune demande à afficher.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
