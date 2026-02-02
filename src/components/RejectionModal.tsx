import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface RejectionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
}

export default function RejectionModal({ isOpen, onClose, onConfirm }: RejectionModalProps) {
    const [reason, setReason] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (reason.trim()) {
            onConfirm(reason)
            setReason('')
            // onClose is handled by parent usually after success, or we close here?
            // Let's close here or let parent handle. Parent calls confirm then closes.
        }
    }

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
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-red-50">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-red-900">
                                            Rejeter la demande
                                        </Dialog.Title>
                                        <p className="text-sm text-red-700 mt-1">
                                            Action irréversible.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors bg-white p-2 rounded-full hover:bg-red-50">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="px-8 py-6">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Veuillez fournir un motif clair pour le rejet. Ce message sera envoyé au demandeur.
                                    </p>
                                    
                                    <textarea
                                        className="w-full border-gray-300 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 shadow-sm bg-gray-50 focus:bg-white transition-colors"
                                        rows={4}
                                        placeholder="Ex: Le budget pour ce projet a été suspendu."
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />

                                    <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                                            onClick={onClose}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!reason.trim()}
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Confirmer le rejet
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
