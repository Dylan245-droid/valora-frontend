import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import type { User } from '../types/auth'
import api from '../api/client'
import toast from 'react-hot-toast'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    user?: User // If provided, edit mode
}

interface Option {
    id: number
    name: string
    minAmount?: number
    maxAmount?: number
    entityId?: number
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
    const isEdit = !!user
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        entityId: '',
        departmentId: '',
        approvalGroupId: '',
        dateOfBirth: '',
        placeOfBirth: '',
    })

    const [entities, setEntities] = useState<Option[]>([])

    const [departments, setDepartments] = useState<Option[]>([])
    const [approvalGroups, setApprovalGroups] = useState<Option[]>([])
    const [loadingInfo, setLoadingInfo] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchOptions()
            if (user) {
                setFormData({
                    fullName: user.fullName || '',
                    email: user.email,
                    password: '', 
                    role: user.role,
                    entityId: (departments.find(d => d.id === user.departmentId)?.entityId || '').toString(),
                    departmentId: user.departmentId?.toString() || '',
                    approvalGroupId: user.approvalGroupId?.toString() || '',
                    dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
                    placeOfBirth: user.placeOfBirth || '',
                })
            } else {
                setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'EMPLOYEE',
                    entityId: '',
                    departmentId: '',
                    approvalGroupId: '',
                    dateOfBirth: '',
                    placeOfBirth: '',
                })
            }
        }
    }, [isOpen, user, departments.length])

    const fetchOptions = async () => {
        setLoadingInfo(true)
        try {
            const [deptRes, groupRes, entRes] = await Promise.all([
                api.get('/departments'),
                api.get('/approval-groups'),
                api.get('/entities')
            ])
            setDepartments(deptRes.data)
            setApprovalGroups(groupRes.data)
            setEntities(entRes.data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load options')
        } finally {
            setLoadingInfo(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload: any = { ...formData }
            
            // Clean up payload
            if (!payload.password) delete payload.password
            if (payload.departmentId) payload.departmentId = parseInt(payload.departmentId)
            else delete payload.departmentId
            
            if (payload.approvalGroupId) payload.approvalGroupId = parseInt(payload.approvalGroupId)
            else payload.approvalGroupId = null // Explicitly clear if empty
            
            if (!payload.dateOfBirth) delete payload.dateOfBirth
            if (!payload.placeOfBirth) delete payload.placeOfBirth

            if (isEdit && user) {
                await api.put(`/users/${user.id}`, payload)
                toast.success('User updated')
            } else {
                await api.post('/users', payload)
                toast.success('User created')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to save user')
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col max-h-[90vh] border border-gray-100">
                                {/* Fixed Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                            {isEdit ? 'Modifier Utilisateur' : 'Créer Utilisateur'}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Gérez les accès et les permissions de votre équipe.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto px-8 py-6">
                                    {loadingInfo ? (
                                        <div className="flex justify-center py-8">
                                            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    ) : (
                                        <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom Complet</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="John Doe"
                                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                    value={formData.fullName}
                                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="john@example.com"
                                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date de Naissance</label>
                                                    <input
                                                        type="date"
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                        value={formData.dateOfBirth}
                                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lieu de Naissance</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Douala"
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                        value={formData.placeOfBirth}
                                                        onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Mot de passe {isEdit && <span className="text-gray-400 font-normal ml-1 text-xs">(Laisser vide pour conserver)</span>}
                                                </label>
                                                <input
                                                    type="password"
                                                    required={!isEdit}
                                                    placeholder={!isEdit ? '••••••••' : ''}
                                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rôle</label>
                                                    <select
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                        value={formData.role}
                                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                                    >
                                                        <option value="EMPLOYEE">Employé</option>
                                                        <option value="MANAGER">Manager</option>
                                            <option value="BUYER">Acheteur</option>
                                            <option value="ACCOUNTANT">Comptable</option>
                                            <option value="ADMIN">Administrateur</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Entité</label>
                                                    <select
                                                        required
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                        value={formData.entityId}
                                                        onChange={e => setFormData({ ...formData, entityId: e.target.value, departmentId: '' })}
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {entities.map(entity => (
                                                            <option key={entity.id} value={entity.id}>{entity.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service (Département)</label>
                                                    <select
                                                        required
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                                        value={formData.departmentId}
                                                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                                        disabled={!formData.entityId}
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {departments
                                                            .filter(dept => dept.entityId === parseInt(formData.entityId))
                                                            .map(dept => (
                                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {formData.role === 'MANAGER' && (
                                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                                    <label className="block text-sm font-semibold text-indigo-900 mb-1">Groupe d'Approbation</label>
                                                    <p className="text-xs text-indigo-600 mb-3">Définit les limites de validation pour ce manager.</p>
                                                    <select
                                                        className="block w-full rounded-xl border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-white transition-colors"
                                                        value={formData.approvalGroupId}
                                                        onChange={e => setFormData({ ...formData, approvalGroupId: e.target.value })}
                                                    >
                                                        <option value="">Aucun Groupe (Standard)</option>
                                                        {approvalGroups.map(group => (
                                                            <option key={group.id} value={group.id}>
                                                                {group.name} (Min: {new Intl.NumberFormat('fr-FR').format(group.minAmount || 0)} - Max: {new Intl.NumberFormat('fr-FR').format(group.maxAmount || 0)})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </form>
                                    )}
                                </div>

                                {/* Fixed Footer */}
                                <div className="px-8 py-6 bg-white border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                                        onClick={onClose}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        form="user-form"
                                        className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                                    >
                                        {isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur'}
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
