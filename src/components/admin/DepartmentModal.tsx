import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../../components/ui/Button'
import api from '../../api/client'
import toast from 'react-hot-toast'
import type { Department, Entity } from '../../types/organization'

interface DepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    department?: Department
    entities: Entity[]
    onSuccess: () => void
}

export default function DepartmentModal({ isOpen, onClose, department, entities, onSuccess }: DepartmentModalProps) {
    const [name, setName] = useState('')
    const [entityId, setEntityId] = useState<number | ''>('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (department) {
            setName(department.name)
            setEntityId(department.entityId || '')
        } else {
            setName('')
            setEntityId('')
        }
    }, [department])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = { name, entityId: entityId || null }
            if (department) {
                await api.put(`/departments/${department.id}`, payload)
                toast.success('Service modifié')
            } else {
                await api.post('/departments', payload)
                toast.success('Service créé')
            }
            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!department) return
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return
        
        setLoading(true)
        try {
            await api.delete(`/departments/${department.id}`)
            toast.success('Service supprimé')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error("Erreur lors de la suppression")
        } finally {
            setLoading(false)
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                            {department ? 'Modifier le Service' : 'Nouveau Service'}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Structurez votre organisation interne.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du Service <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Direction Financière"
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Entité de rattachement</label>
                                        <select
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50"
                                            value={entityId}
                                            onChange={(e) => setEntityId(Number(e.target.value) || '')}
                                        >
                                            <option value="">-- Aucune (Non recommandé) --</option>
                                            {entities.map((ent) => (
                                                <option key={ent.id} value={ent.id}>{ent.name}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Lier ce service à une entité juridique permet de mieux ségmenter les achats.</p>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            {department && (
                                                <Button type="button" variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={handleDelete} isLoading={loading}>
                                                   <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                   Supprimer
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
                                            <Button type="submit" isLoading={loading} className="px-6">{department ? 'Enregistrer' : 'Créer'}</Button>
                                        </div>
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
