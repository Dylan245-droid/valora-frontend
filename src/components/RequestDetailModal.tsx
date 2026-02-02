import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import type { PurchaseRequest } from '../types/request'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getStatusLabel, formatCurrency, getStageLabel } from '../utils/formatting'
import { getStorageUrl } from '../utils/config'
import QuoteList from './QuoteList'
import QuoteUploadModal from './QuoteUploadModal'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Button } from './ui/Button'

interface RequestDetailModalProps {
    isOpen: boolean
    onClose: () => void
    request?: PurchaseRequest
}

export default function RequestDetailModal({ isOpen, onClose, request: initialRequest }: RequestDetailModalProps) {
    const { user } = useAuth()
    const [request, setRequest] = useState<PurchaseRequest | undefined>(initialRequest)
    const [isQuoteUploadOpen, setIsQuoteUploadOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [downPayment, setDownPayment] = useState('')
    const [paymentDueAt, setPaymentDueAt] = useState('')
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

    useEffect(() => {
        setRequest(initialRequest)
    }, [initialRequest])

    const refreshRequest = async () => {
        if (!request) return
        try {
            const res = await api.get(`/purchase-requests/${request.id}`)
            setRequest(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    const handleSelectQuote = async (quoteId: number) => {
        if (!request) return
        if (request.selectedQuoteId) return // Double check frontend side

        if (!confirm('Attention : Ce choix est définitif. Voulez-vous sélectionner ce devis ?')) return
        
        // Optimistic Update
        const previousRequest = { ...request }
        setRequest({ ...request, selectedQuoteId: quoteId })

        try {
            await api.post(`/purchase-requests/${request.id}/select-quote`, { quoteId })
            toast.success('Devis sélectionné avec succès')
            // No need to refresh immediately if we trust the optimistic update, but refreshing is safer for consistency
            // refreshRequest() 
        } catch (error) {
            // Revert on error
            setRequest(previousRequest)
            toast.error('Erreur lors de la sélection')
            console.error(error)
        }
    }

    const handleConfirmPayment = async () => {
        if (!request) return
        if (!confirm('Confirmer que le solde de cette facture a été payé ?')) return
        setProcessing(true)
        try {
            await api.post(`/purchase-requests/${request.id}/confirm-payment`)
            toast.success('Paiement confirmé avec succès')
            refreshRequest()
        } catch (error) {
            toast.error('Erreur lors de la confirmation du paiement')
        } finally {
            setProcessing(false)
        }
    }

    const handleFinalize = async () => {
        if (!request) return
        if (!confirm('Confirmer et lancer le circuit de validation ?')) return
        setProcessing(true)
        try {
            await api.post(`/purchase-requests/${request.id}/finalize`)
            toast.success('Commande finalisée, validation lancée')
            refreshRequest()
            onClose() // Close to show update in list or stay? stay usually better but status updates.
        } catch (error) {
            toast.error('Erreur lors de la finalisation')
        } finally {
            setProcessing(false)
        }
    }

    if (!request) return null

    return (
        <>
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh] border border-gray-100">
                                
                                {/* Fixed Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 shrink-0">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                                Demande #{request.id}
                                            </Dialog.Title>
                                            <div className="flex flex-col gap-1 items-end">
                                                <div className="flex gap-2">
                                                     <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold border uppercase tracking-wider
                                                        ${request.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                          request.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                          'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold border uppercase tracking-wider
                                                        ${request.stage === 'NEED' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                                          request.stage === 'SOURCING' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                          request.stage === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                          'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                        {getStageLabel(request.stage)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Référence #{request.id}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 gap-4">
                                            <span className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
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
                                                    <span className="font-semibold text-gray-900">{request.user?.fullName}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {request.user?.department?.entity?.name} • {request.user?.department?.name}
                                                    </span>
                                                </div>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50">
                                        <span className="sr-only">Fermer</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 bg-gray-50/30">
                                    
                                    {/* Main Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Description Card */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                                    Détails de la demande
                                                </h4>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.title}</h3>
                                                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg">
                                                    {request.description || 'Aucune description disponible.'}
                                                </p>
                                                
                                                {/* Items Table */}
                                                <div className="mt-6">
                                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qté</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">P.U.</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                 {request.items.map((item, idx) => (
                                                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.description}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-500 text-right tabular-nums">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(item.unitPrice || 0)}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold tabular-nums">
                                                                            {formatCurrency(item.quantity * (item.unitPrice || 0))}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr className="bg-indigo-50/30">
                                                                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Total Estimé</td>
                                                                    <td className="px-4 py-3 text-base font-bold text-indigo-600 text-right tabular-nums">
                                                                        {request.totalEstimatedAmount ? formatCurrency(request.totalEstimatedAmount) : 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sourcing / Quotes */}
                                            {(request.stage === 'NEED' || request.stage === 'SOURCING' || (request.quotes && request.quotes.length > 0)) && (
                                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            Sourcing & Devis
                                                        </h4>
                                                        {user?.role === 'BUYER' && request.stage !== 'VALIDATION' && (
                                                            <Button size="sm" variant="outline" onClick={() => setIsQuoteUploadOpen(true)} className="text-xs">
                                                                + Ajouter un devis
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <QuoteList 
                                                        quotes={request.quotes || []}
                                                        selectedQuoteId={request.selectedQuoteId}
                                                        isSelectionEnabled={user?.id === request.userId && request.stage !== 'VALIDATION' && !request.selectedQuoteId}
                                                        onSelect={handleSelectQuote}
                                                    />

                                                    {user?.role === 'BUYER' && request.stage !== 'VALIDATION' && request.selectedQuoteId && (
                                                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                                                            <Button onClick={handleFinalize} disabled={processing} className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                                                                {processing ? 'Traitement...' : 'Soumettre pour Validation'}
                                                            </Button>
                                                            {/* Final Invoice Section (New) */}

                                        </div>
                                                    )}
                                                </div>
                                            )}


                                        {/* Final Invoice Section (New) */}
                                        {(request.status === 'APPROVED' || request.stage === 'INVOICED' || request.stage === 'PENDING_PAYMENT') && (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    Facturation Finale & Achat
                                                </h4>

                                                {request.stage === 'INVOICED' ? (
                                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Commande Finalisée</p>
                                                                <p className="text-xs text-gray-600">Facture N° <span className="font-mono font-bold">{request.invoiceNumber}</span></p>
                                                            </div>
                                                        </div>
                                                        {request.invoiceFilePath && (
                                                            <div className="mt-3 pl-13">
                                                                <a 
                                                                    href={`${import.meta.env.VITE_STORAGE_URL}${request.invoiceFilePath}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                                    Télécharger la facture
                                                                </a>
                                                            </div>
                                                        )}
                                                        <div className="mt-4 pt-4 border-t border-emerald-200/50 flex flex-col gap-1.5 text-[11px] text-emerald-800">
                                                            <div className="flex justify-between">
                                                                <span className="opacity-75">Facture reçue le :</span>
                                                                <span className="font-bold">
                                                                    {request.invoiceReceivedAt ? format(new Date(request.invoiceReceivedAt), 'dd/MM/yyyy') : format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="opacity-75">Montant Final :</span>
                                                                <span className="font-bold">{formatCurrency(request.totalEstimatedAmount || 0)}</span>
                                                            </div>
                                                            {request.downPayment && (
                                                                <div className="flex justify-between">
                                                                    <span className="opacity-75">Acompte versé :</span>
                                                                    <span className="font-bold">{formatCurrency(request.downPayment)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center text-emerald-900 bg-emerald-100/50 px-2 py-1.5 rounded-md mt-1">
                                                                <span className="font-semibold italic">Solde payé le {request.paidAt ? format(new Date(request.paidAt), 'dd/MM/yyyy') : 'confirmé'}</span>
                                                                {request.paymentDueAt && (
                                                                    <span className="text-[10px] opacity-60">(Échéance : {format(new Date(request.paymentDueAt), 'dd/MM/yyyy')})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : request.stage === 'PENDING_PAYMENT' ? (
                                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">En attente de paiement final</p>
                                                                    <p className="text-xs text-gray-600">
                                                                        Facture N° <span className="font-mono font-bold">{request.invoiceNumber}</span>
                                                                        {request.paymentDueAt && ` • Échéance : ${format(new Date(request.paymentDueAt), 'dd/MM/yyyy')}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {user?.role === 'ACCOUNTANT' && (
                                                                <Button 
                                                                    onClick={handleConfirmPayment}
                                                                    disabled={processing}
                                                                    size="sm"
                                                                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                                                >
                                                                    Confirmer le Paiement
                                                                </Button>
                                                            )}
                                                        </div>
                                                        
                                                        {request.downPayment && (
                                                            <div className="mt-3 pt-3 border-t border-amber-100 flex justify-between text-xs text-amber-800 font-medium">
                                                                <span>Acompte payé : {formatCurrency(request.downPayment)}</span>
                                                                <span>Reste à payer : {formatCurrency((request.totalEstimatedAmount || 0) - request.downPayment)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    user?.role === 'BUYER' ? (
                                                        <form 
                                                            onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                
                                                                if (paymentDueAt && !downPayment) {
                                                                    toast.error("Un acompte est obligatoire si une date d'échéance est fixée.");
                                                                    return;
                                                                }

                                                                setProcessing(true);
                                                                try {
                                                                    const formData = new FormData(e.currentTarget);
                                                                    await api.post(`/purchase-requests/${request.id}/invoice`, formData, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    toast.success('Facture enregistrée avec succès');
                                                                    refreshRequest();
                                                                } catch (err: any) {
                                                                    toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
                                                                } finally {
                                                                    setProcessing(false);
                                                                }
                                                            }}
                                                            className="space-y-6"
                                                        >
                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de Facture</label>
                                                                <input type="text" name="invoiceNumber" required 
                                                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors" 
                                                                    placeholder="Ex: INV-2024-001" />
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reçu le</label>
                                                                    <input type="date" name="invoiceReceivedAt" defaultValue={new Date().toISOString().split('T')[0]} 
                                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Échéance (Facultatif)</label>
                                                                    <input type="date" name="paymentDueAt" 
                                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors" 
                                                                        onChange={(e) => setPaymentDueAt(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className={`p-4 rounded-xl border transition-colors ${paymentDueAt ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <label className={`block text-sm font-semibold ${paymentDueAt ? 'text-amber-900' : 'text-indigo-900'}`}>
                                                                        Acompte / Paiement partiel {paymentDueAt && <span className="text-rose-500">*</span>}
                                                                    </label>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${paymentDueAt ? 'text-amber-700 bg-amber-100' : 'text-indigo-600 bg-indigo-100'}`}>
                                                                        {paymentDueAt ? 'Requis' : 'Optionnel'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-4 items-center">
                                                                    <div className="flex-1 relative">
                                                                        <input 
                                                                            type="number" 
                                                                            name="downPayment" 
                                                                            className="block w-full rounded-xl border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 pl-4 bg-white"
                                                                            placeholder="Montant versé..."
                                                                            onChange={(e) => setDownPayment(e.target.value)} 
                                                                        />
                                                                        <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-bold">FCFA</span>
                                                                    </div>
                                                                    {downPayment && request.totalEstimatedAmount && (
                                                                        <div className="text-right min-w-[120px]">
                                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Reste à payer</p>
                                                                            <p className="text-sm font-bold text-gray-900">
                                                                                {formatCurrency(Math.max(0, request.totalEstimatedAmount - (parseFloat(downPayment) || 0)))}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fichier (PDF/Image)</label>
                                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer bg-white relative">
                                                                    <input 
                                                                        type="file" 
                                                                        name="invoiceFile" 
                                                                        required 
                                                                        accept=".pdf,.jpg,.jpeg,.png" 
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        onChange={(e) => setInvoiceFile(e.target.files ? e.target.files[0] : null)}
                                                                    />
                                                                    <div className="space-y-1 text-center">
                                                                        <svg className={`mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors ${invoiceFile ? 'text-indigo-500' : ''}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                                            <span className="relative rounded-md font-medium text-indigo-600 group-hover:text-indigo-500">
                                                                                {invoiceFile ? 'Changer le fichier' : 'Téléverser un fichier'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">
                                                                            {invoiceFile ? invoiceFile.name : "PDF, PNG, JPG jusqu'à 10MB"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2 flex justify-end">
                                                                <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 px-6 py-2.5 rounded-xl font-bold">
                                                                    {processing ? 'Enregistrement...' : 'Valider & Enregistrer'}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500 italic">
                                                            L'acheteur doit finaliser l'achat et importer la facture.
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        </div>

                                        {/* Sidebar Stats */}
                                        <div className="space-y-6">
                                            {/* Approval Workflow */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Validation
                                                </h4>
                                                
                                                {request.requestApprovals && request.requestApprovals.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <div className="w-1 bg-gray-100 absolute left-4 h-full z-0 hidden"></div> 
                                                        {request.requestApprovals.map((approval) => (
                                                            <div key={approval.id} className={`relative pl-4 border-l-2 ${
                                                                approval.status === 'APPROVED' ? 'border-emerald-500' :
                                                                approval.status === 'REJECTED' ? 'border-rose-500' : 'border-gray-200'
                                                            }`}>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-sm font-semibold text-gray-900">{approval.approvalGroup.name}</span>
                                                                    {approval.status === 'APPROVED' ? (
                                                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                    ) : approval.status === 'REJECTED' ? (
                                                                        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    ) : (
                                                                          <span className="h-2 w-2 rounded-full bg-gray-300 mt-1.5"></span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500">
                                                                    {approval.status === 'APPROVED' ? `Validé par ${approval.approver?.fullName}` :
                                                                     approval.status === 'REJECTED' ? `Refusé par ${approval.approver?.fullName}` : 'En attente'}
                                                                </p>
                                                                {approval.approvedAt && (
                                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                                                                        {format(new Date(approval.approvedAt), 'dd MMM HH:mm', { locale: fr })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
                                                        <p className="text-xs text-gray-400 italic">Aucun circuit requis.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attachments */}
                                            {request.attachments && request.attachments.length > 0 && (
                                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                        Pièces Jointes
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {request.attachments.map((file) => (
                                                            <a 
                                                                key={file.id} 
                                                                href={`${import.meta.env.VITE_STORAGE_URL}${file.filePath}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer" 
                                                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-100"
                                                            >
                                                                <div className="h-8 w-8 rounded bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.293 3.293a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-indigo-700">{file.fileName}</p>
                                                                    <p className="text-[10px] text-gray-400 uppercase">{(file.fileSize / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* History Mini */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Historique
                                                </h4>
                                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pt-2">
                                                    {request.audits?.map((audit, idx) => (
                                                        <div key={audit.id} className="relative pl-6 group">
                                                            {/* Vertical line connector */}
                                                            {idx < (request.audits?.length || 0) - 1 && (
                                                                <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-gray-100 group-last:hidden"></div>
                                                            )}
                                                            
                                                            <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100
                                                                ${audit.action === 'CREATED' ? 'bg-blue-500' :
                                                                  audit.action === 'UPDATED' ? 'bg-amber-400' :
                                                                  audit.action === 'APPROVED' ? 'bg-emerald-500' :
                                                                  audit.action === 'REJECTED' ? 'bg-rose-500' :
                                                                  audit.action === 'STATUS_CHANGE' ? 'bg-indigo-500' : 
                                                                  audit.action === 'QUOTE_ADDED' ? 'bg-purple-500' :
                                                                  audit.action === 'QUOTE_SELECTED' ? 'bg-teal-500' : 'bg-gray-400'
                                                                }`}></div>
                                                                
                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                                                    {audit.action === 'CREATED' ? 'Demande créée' : 
                                                                     audit.action === 'UPDATED' ? (
                                                                         audit.details?.action === 'INVOICE_UPLOADED' ? `Facture finale ajoutée${audit.details?.invoiceNumber ? ` #${audit.details.invoiceNumber}` : ''}` :
                                                                         audit.details?.action === 'PAYMENT_CONFIRMED' ? 'Paiement confirmé' :
                                                                         audit.details?.stage === 'VALIDATION' 
                                                                         ? 'Envoyé pour validation' 
                                                                         : 'Détails de la demande modifiés'
                                                                     ) : 
                                                                     audit.action === 'APPROVED' ? 'Validation effectuée' :
                                                                     audit.action === 'REJECTED' ? 'Demande rejetée' :
                                                                     audit.action === 'QUOTE_ADDED' ? 'Nouveau devis ajouté' :
                                                                     audit.action === 'QUOTE_SELECTED' ? 'Fournisseur sélectionné' :
                                                                     audit.action === 'STATUS_CHANGE' ? (
                                                                         audit.details?.new_status === 'PROCESSING' 
                                                                           ? 'Traitement en cours' 
                                                                           : `Nouveau statut : ${getStatusLabel(audit.details?.new_status || 'Inconnu')}`
                                                                     ) : audit.action}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] text-gray-500 font-medium">{audit.user?.fullName}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                                                    <time className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                                                        {format(new Date(audit.createdAt), 'dd MMM HH:mm', { locale: fr })}
                                                                    </time>
                                                                </div>
                                                                
                                                                {/* Details for Quotes */}
                                                                {(audit.action === 'QUOTE_ADDED' || audit.action === 'QUOTE_SELECTED') && audit.details?.supplierName && (
                                                                    <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">
                                                                        <span className="font-semibold">{audit.details.supplierName}</span>
                                                                        {audit.details.amount && ` - ${formatCurrency(audit.details.amount)}`}
                                                                    </p>
                                                                )}

                                                                {audit.details?.reason && (
                                                                    <p className="mt-2 text-xs text-rose-600 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50 italic leading-relaxed">
                                                                        "{audit.details.reason}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                                
                                {/* Fixed Footer */}
                                <div className="border-t border-gray-100 bg-white px-8 py-5 flex justify-between items-center shrink-0">
                                    <div className="text-sm text-gray-500 italic">
                                        Dernière mise à jour: {format(new Date(request.updatedAt), 'dd MMMM HH:mm', { locale: fr })}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-all"
                                            onClick={onClose}
                                        >
                                            Fermer
                                        </button>
                                        {request.status === 'APPROVED' && (
                                            <button
                                                type="button"
                                                className="rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                                                onClick={() => window.open(`/print-request/${request.id}`, '_blank')}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Imprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
        <QuoteUploadModal 
            isOpen={isQuoteUploadOpen}
            onClose={() => setIsQuoteUploadOpen(false)}
            requestId={request.id}
            onSuccess={refreshRequest}
        />
        </>
    )
}
