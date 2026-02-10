import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import type { PurchaseRequest } from '../types/request'
import { formatCurrency } from '../utils/formatting'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PrintRequestPage() {
    const { id } = useParams()
    const [request, setRequest] = useState<PurchaseRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`/purchase-requests/${id}`)
                setRequest(response.data)
            } catch (error) {
                console.error(error)
                alert('Impossible de charger la demande')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchRequest()
    }, [id])

    if (loading) return <div className="p-10 text-center">Chargement du certificat...</div>
    if (!request) return <div className="p-10 text-center text-red-600">Demande introuvable</div>

    return (
        <div className="max-w-[210mm] mx-auto bg-white p-10 min-h-screen print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">OKIVEL</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Enterprise Edition</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">Demande d'Achat</h2>

                    <p className="text-sm text-gray-600 mt-2">
                        Créé le {format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                </div>
            </div>

            {/* Applicant & Buyer Info */}
            <div className="mb-8 grid grid-cols-2 gap-8">
                {/* Applicant */}
                <div className="bg-gray-50 p-6 rounded-lg print:bg-transparent print:border print:border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Demandeur</h3>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900 leading-tight">{request.user?.fullName}</p>
                            <p className="text-sm text-gray-600 mb-2">{request.user?.email}</p>
                            
                            <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex text-xs">
                                    <span className="text-gray-500 w-20">Entité :</span>
                                    <span className="font-semibold text-gray-900">{request.user?.department?.entity?.name || '-'}</span>
                                </div>
                                <div className="flex text-xs">
                                    <span className="text-gray-500 w-20">Service :</span>
                                    <span className="font-semibold text-gray-900">{request.user?.department?.name || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buyer / Technical Context */}
                <div className="bg-gray-50 p-6 rounded-lg print:bg-transparent print:border print:border-gray-200">
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Acheteur / Responsable</h3>
                     {(() => {
                        // Attempt to find the buyer/handler from audits
                        const buyerAudit = request.audits?.find(a => 
                            a.action === 'PROCESSING' || 
                            a.action === 'QUOTE_SELECTED' || 
                            a.action === 'INVOICE_UPLOADED'
                        )?.user;
                        
                        return buyerAudit ? (
                            <div>
                                <p className="font-bold text-lg text-gray-900">{buyerAudit.fullName}</p>
                                <p className="text-sm text-gray-600">{buyerAudit.email}</p>
                                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">Dossier traité</p>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">
                                Non assigné ou en attente de traitement
                            </div>
                        );
                     })()}
                     
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Objet de la demande</h3>
                        <p className="font-semibold text-gray-900">{request.title}</p>
                        {request.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>}
                    </div>
                </div>
            </div>

            {/* Analytical Imputation */}
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl print:bg-transparent">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Imputation Budgétaire</h3>
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Code Général</p>
                        <p className="text-sm font-bold text-gray-900">
                            {request.analyticalCode?.activity?.project?.catalog?.name || request.analyticalCode?.project?.catalog?.name || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Code Spécifique</p>
                        <p className="text-sm font-bold text-gray-900">
                            {request.analyticalCode?.activity?.project?.name || request.analyticalCode?.project?.name || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Code Département</p>
                        <p className="text-sm font-bold text-gray-900">
                            {request.analyticalCode?.activity?.name || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Code Identitaire</p>
                        <p className="text-sm font-black text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                            {request.analyticalCode?.code || '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto print:overflow-visible">
                <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800 text-left print:bg-gray-200">
                            <th className="py-3 px-4 font-bold uppercase text-xs text-gray-600">Description</th>
                            <th className="py-3 px-4 font-bold uppercase text-xs text-gray-600 text-right">Qté</th>
                            <th className="py-3 px-4 font-bold uppercase text-xs text-gray-600 text-right">P.U.</th>
                            <th className="py-3 px-4 font-bold uppercase text-xs text-gray-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {request.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 px-4 text-sm">{item.description}</td>
                                <td className="py-3 px-4 text-sm text-right">{item.quantity}</td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.unitPrice || 0)}</td>
                                <td className="py-3 px-4 text-sm text-right font-bold">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-800">
                            <td colSpan={3} className="py-4 px-4 text-right font-bold uppercase text-sm">Total Estimé</td>
                            <td className="py-4 px-4 text-right font-bold text-xl">{formatCurrency(request.totalEstimatedAmount || 0)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Approvals / Certificate */}
            <div className="mt-12 border-2 border-indigo-900 rounded-xl p-8 relative print:break-inside-avoid">
                <div className="absolute -top-4 left-8 bg-white px-4 text-indigo-900 font-bold uppercase tracking-widest border border-indigo-900 shadow-sm">
                    Certificat de Validation
                </div>
                
                {request.status === 'APPROVED' ? (
                    <div className="grid grid-cols-2 gap-8">
                         {request.requestApprovals?.map((approval) => (
                             <div key={approval.id} className="border border-gray-200 rounded p-4 relative">
                                 <div className="text-xs text-gray-500 uppercase mb-1">Groupe / Niveau</div>
                                 <div className="font-bold text-gray-900">{approval.approvalGroup.name}</div>
                                 
                                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                     <div className="bg-emerald-100 text-emerald-800 rounded-full p-1">
                                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-gray-500 uppercase tracking-wide">Validé par</div>
                                         <div className="font-bold text-gray-900">{approval.approver?.fullName}</div>
                                         
                                        {/* Manager Details */}
                                        <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                            {approval.approver?.department?.name}
                                            {approval.approver?.department?.entity?.name && (
                                                <span className="text-gray-400"> • {approval.approver.department.entity.name}</span>
                                            )}
                                        </div>

                                         <div className="flex items-center gap-1 mt-2">
                                             <span className="text-xs text-gray-500">le</span>
                                             <span className="font-mono text-sm font-bold">
                                                 {approval.approvedAt ? format(new Date(approval.approvedAt), 'dd/MM/yyyy à HH:mm') : '-'}
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 italic py-8">
                        Ce document n'a pas encore été validé intégralement.
                    </div>
                )}

                <div className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
                    Document généré électroniquement par OKIVEL System • {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
                </div>
            </div>

            {/* Print Trigger */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Imprimer
                </button>
            </div>
        </div>
    )
}
