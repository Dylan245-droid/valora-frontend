import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { type PurchaseRequest } from '../types/request'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getStorageUrl } from '../utils/config'

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
    const entity = request.user?.department?.entity

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            {/* Header / Actions (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                    ← Retour
                </button>
                <button 
                    onClick={handlePrint}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition"
                >
                    Imprimer / PDF
                </button>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:m-0 print:w-full">
                
                {/* Header Section */}
                <div className="border-b-4 border-red-700 p-8 pb-6">
                    <div className="flex items-center gap-4">
                        {entity?.logo ? (
                            <img 
                                src={getStorageUrl(entity.logo)} 
                                alt={entity.name} 
                                className="h-16 w-16 object-contain"
                            />
                        ) : (
                            <div className="h-16 w-16 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                                {entity?.name?.charAt(0) || 'O'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-gray-900">
                                Bon de commande
                            </h1>
                            {/* PO Number Box - Always visible */}
                            <div className="mt-2 border-2 border-green-600 px-8 py-1 text-center inline-block">
                                <span className="text-xl font-mono font-bold text-gray-900">
                                    {request.sequenceNumber || request.poNumber || `${String(request.id).padStart(4, '0')}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Info Section */}
                <div className="p-8 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{entity?.name}</h2>
                            <p className="text-sm text-gray-600">{entity?.address || 'Port-Gentil, Gabon'}</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                                {entity?.nif && <p>NIF : {entity.nif}</p>}
                                {entity?.poBox && <p>BP : {entity.poBox}</p>}
                            </div>
                            {entity?.phone && <p className="text-sm text-gray-600">Téléphone : {entity.phone}</p>}
                        </div>
                    </div>

                    {/* Info Table */}
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <table className="text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Date :</td>
                                        <td className="py-1 font-semibold">{format(new Date(), 'dd/MM/yyyy')}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Contact client :</td>
                                        <td className="py-1 font-semibold">{selectedQuote?.supplierName || 'Non sélectionné'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Émis par :</td>
                                        <td className="py-1 font-semibold">{request.user?.fullName}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Code général :</td>
                                        <td className="py-1">
                                            <div className="flex justify-between min-w-[200px]">
                                                <span>{request.analyticalCode?.activity?.project?.catalog?.name || '-'}</span>
                                                <span className="font-mono text-right ml-8">{request.analyticalCode?.activity?.project?.catalog?.code || '-'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Code Spécifique :</td>
                                        <td className="py-1">
                                            <div className="flex justify-between min-w-[200px]">
                                                <span>{request.analyticalCode?.activity?.project?.name || '-'}</span>
                                                <span className="font-mono text-right ml-8">{request.analyticalCode?.activity?.project?.code || '-'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 pr-4 text-gray-500 font-medium">Code Département :</td>
                                        <td className="py-1">
                                            <div className="flex justify-between min-w-[200px]">
                                                <span>{request.analyticalCode?.activity?.name || request.user?.department?.name || '-'}</span>
                                                <span className="font-mono text-right ml-8">{request.analyticalCode?.activity?.code || '-'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Client name - without label */}
                        <div className="flex-1 text-right">
                            <p className="text-xl font-bold text-gray-900">{selectedQuote?.supplierName || 'Non sélectionné'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-400">
                                <th className="py-2 text-xs font-bold text-gray-600 uppercase">#</th>
                                <th className="py-2 text-xs font-bold text-gray-600 uppercase">Désignation</th>
                                <th className="py-2 text-xs font-bold text-gray-600 uppercase text-center w-24">Quantité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(selectedQuote?.items?.length ? selectedQuote.items : request.items)?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="py-3 text-sm font-medium text-gray-900">{item.description}</td>
                                    <td className="py-3 text-sm text-center">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty Rows (for additional items/notes) */}
                <div className="px-8 pb-8 min-h-[100px]">
                    {/* Placeholder for printing rows or notes */}
                </div>

                {/* Visa Sections */}
                <div className="border-t border-gray-200 p-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-4">Visa Service Achat</p>
                            <div className="h-20 border border-gray-300 rounded"></div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-purple-700 mb-4">
                                Visa DG: {entity?.address?.split(',')[0] || 'POG'}, le {format(new Date(), 'dd/MM/yyyy')}
                            </p>
                            <div className="h-20 border border-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Footer: Siège social + Détails bancaires */}
                <div className="border-t-2 border-gray-300 p-8 bg-gray-50 print:bg-white">
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        {/* Siège social */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Siège social</h4>
                            <p className="text-gray-600">{entity?.address || 'Port-Gentil'}</p>
                            {entity?.nif && <p className="text-gray-600">NIF : {entity.nif}</p>}
                            {entity?.poBox && <p className="text-gray-600">BP : {entity.poBox}</p>}
                        </div>

                        {/* Détails bancaires */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Détails bancaires</h4>
                            {entity?.bankName ? (
                                <table className="text-gray-600">
                                    <tbody>
                                        <tr>
                                            <td className="pr-4">Banque</td>
                                            <td className="font-medium">{entity.bankName}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-4">Code banque</td>
                                            <td className="font-mono">{entity.bankCode || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-4">N° de compte</td>
                                            <td className="font-mono">{entity.bankAccount || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-4">IBAN</td>
                                            <td className="font-mono">{entity.iban || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-4">SWIFT/BIC</td>
                                            <td className="font-mono">{entity.swift || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-400 italic">Non configuré</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
