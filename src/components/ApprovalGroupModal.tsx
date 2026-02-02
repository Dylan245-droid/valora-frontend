import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import type { ApprovalGroup } from '../types/auth'
import api from '../api/client'
import toast from 'react-hot-toast'

interface ApprovalGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    group?: ApprovalGroup
}

export default function ApprovalGroupModal({ isOpen, onClose, onSuccess, group }: ApprovalGroupModalProps) {
    const isEdit = !!group
    const [formData, setFormData] = useState({
        name: '',
        minAmount: '',
        maxAmount: '',
        level: '1',
        scope: 'ENTITY'
    })

    useEffect(() => {
        if (isOpen) {
            if (group) {
                setFormData({
                    name: group.name,
                    minAmount: group.minAmount.toString(),
                    maxAmount: group.maxAmount.toString(),
                    level: group.level.toString(),
                    scope: group.scope
                })
            } else {
                setFormData({
                    name: '',
                    minAmount: '0',
                    maxAmount: '',
                    level: '1',
                    scope: 'ENTITY'
                })
            }
        }
    }, [isOpen, group])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                name: formData.name,
                minAmount: parseFloat(formData.minAmount),
                maxAmount: parseFloat(formData.maxAmount),
                level: parseInt(formData.level),
                scope: formData.scope
            }

            if (isEdit && group) {
                await api.put(`/approval-groups/${group.id}`, payload)
                toast.success('Group updated')
            } else {
                await api.post('/approval-groups', payload)
                toast.success('Group created')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to save group')
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                {/* Fixed Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                            {isEdit ? 'Modifier le Groupe' : 'Créer un Groupe'}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Définissez les règles de validation budgétaires.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du Groupe</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Manager N1"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau d'approbation (1=Bas)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Portée de Validation</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, scope: 'ENTITY' })}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    formData.scope === 'ENTITY' 
                                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                                        : 'border-gray-200 hover:border-indigo-200'
                                                }`}
                                            >
                                                <div className="font-bold text-sm text-gray-900 mb-0.5">🏢 Locale</div>
                                                <div className="text-[10px] text-gray-500 leading-tight">Limite aux demandes de l'entité du manager.</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, scope: 'GLOBAL' })}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    formData.scope === 'GLOBAL' 
                                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                                        : 'border-gray-200 hover:border-indigo-200'
                                                }`}
                                            >
                                                <div className="font-bold text-sm text-gray-900 mb-0.5">🌍 Globale</div>
                                                <div className="text-[10px] text-gray-500 leading-tight">Valide pour toutes les entités de la holding.</div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Min (FCFA)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                value={formData.minAmount}
                                                onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Max (FCFA)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                value={formData.maxAmount}
                                                onChange={e => setFormData({ ...formData, maxAmount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                                            onClick={onClose}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                                        >
                                            {isEdit ? 'Mettre à jour' : 'Créer'}
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
