import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { type PurchaseRequest } from '../types/request'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatCurrency } from '../utils/formatting'
import toast from 'react-hot-toast'

export default function PurchaseOrderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [request, setRequest] = useState<PurchaseRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`/purchase-requests/${id}`)
                setRequest(response.data)
            } catch (error) {
                toast.error('Impossible de charger le bon de commande')
                navigate('/dashboard')
            } finally {
                setLoading(false)
            }
        }
        fetchRequest()
    }, [id, navigate])

    if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>
    if (!request) return null

    const handlePrint = () => {
        window.print()
    }

    const selectedQuote = request.quotes?.find(q => q.id === request.selectedQuoteId)

    return (
        <div className="bg-white min-h-screen p-8 text-gray-900 font-sans print:p-0">
            {/* Header / Actions (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                    ← Retour
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={handlePrint}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition"
                    >
                        Imprimer / PDF
                    </button>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto border border-gray-200 p-12 shadow-sm print:shadow-none print:border-none print:m-0 print:w-full">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {request.user?.department?.entity?.name?.charAt(0) || 'O'}
                            </div>
                            <span className="text-2xl font-black tracking-tight text-indigo-900">
                                {request.user?.department?.entity?.name || 'OKIVEL'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                             {request.user?.department?.entity?.name ? 'Entity' : 'Enterprise Edition'}
                        </p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest">Bon de Commande</h1>
                        <p className="text-gray-500 font-medium mt-1">Réf: PO-{new Date().getFullYear()}-{request.id.toString().padStart(4, '0')}</p>
                        <p className="text-sm text-gray-400 mt-1">Date: {format(new Date(), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fournisseur</h3>
                        {selectedQuote ? (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-lg text-gray-900">{selectedQuote.supplierName}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">Aucun fournisseur sélectionné</p>
                        )}
                    </div>
                    <div>
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Livrer à</h3>
                         <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-900">{request.user?.fullName}</p>
                            <p className="text-sm text-gray-600">{request.user?.email}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {request.user?.department?.entity?.name} - {request.user?.department?.name}
                            </p>
                         </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Détails de la commande</h3>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-left">
                                <th className="py-3 font-bold text-gray-600 text-sm">Description</th>
                                <th className="py-3 font-bold text-gray-600 text-sm w-24 text-center">Qté</th>
                                <th className="py-3 font-bold text-gray-600 text-sm w-32 text-right">Prix Unitaire</th>
                                <th className="py-3 font-bold text-gray-600 text-sm w-32 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {request.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">{formatCurrency(item.unitPrice ?? 0)}</td>
                                    <td className="py-4 text-right font-bold text-gray-900">{formatCurrency(item.totalPrice ?? 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-100">
                                <td colSpan={3} className="py-4 text-right font-bold text-gray-500 uppercase text-xs tracking-wider">Total HT</td>
                                <td className="py-4 text-right font-bold text-xl text-indigo-600">
                                    {selectedQuote ? formatCurrency(selectedQuote.amount) : formatCurrency(request.totalEstimatedAmount ?? 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Validation Signature Area */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                     <div className="grid grid-cols-2 gap-12">
                         <div>
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-8">Validé par</h3>
                             {request.requestApprovals?.filter(a => a.status === 'APPROVED').map(approval => (
                                 <div key={approval.id} className="mb-4">
                                     <p className="font-bold text-gray-900">{approval.approver?.fullName}</p>
                                     <p className="text-xs text-gray-500">
                                         Le {approval.approvedAt ? format(new Date(approval.approvedAt), 'dd MMM yyyy à HH:mm', { locale: fr }) : '-'}
                                     </p>
                                 </div>
                             ))}
                         </div>
                         <div className="text-right">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-12">Signature Autorisée</h3>
                             <div className="h-px bg-gray-200 w-full"></div>
                         </div>
                     </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-xs text-gray-400 border-t border-gray-50 pt-8">
                    <p>Ce document est généré électroniquement par OKIVEL Enterprise Edition.</p>
                </div>
            </div>
        </div>
    )
}
