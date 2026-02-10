import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { type Quote } from '../types/request'
import { formatCurrency } from '../utils/formatting'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getStorageUrl } from '../utils/config'

interface QuoteDetailModalProps {
    isOpen: boolean
    onClose: () => void
    quote: Quote | null
}

export default function QuoteDetailModal({ isOpen, onClose, quote }: QuoteDetailModalProps) {
    if (!quote) return null

    return (
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Dialog.Title className="text-xl font-bold text-white">
                                                Détails du Devis
                                            </Dialog.Title>
                                            <p className="text-indigo-200 text-sm mt-1">
                                                Reçu le {format(new Date(quote.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    {/* Supplier Info */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide">Fournisseur</span>
                                                <p className="font-bold text-gray-900">{quote.supplierName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Montant</span>
                                            <p className="font-bold text-xl text-indigo-600">{formatCurrency(quote.amount)}</p>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    {quote.items && quote.items.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                                                Articles ({quote.items.length})
                                            </h3>
                                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Désignation</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qté</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {quote.items.map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                                                                <td className="px-4 py-3 text-sm text-center font-mono">{item.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Link */}
                                    {quote.filePath && (
                                        <div className="flex items-center justify-center">
                                            <a
                                                href={getStorageUrl(quote.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Voir le document PDF
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
