import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../../components/ui/Button'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { getStorageUrl } from '../../utils/config'
import type { Entity } from '../../types/organization'

interface EntityModalProps {
    isOpen: boolean
    onClose: () => void
    entity?: Entity
    onSuccess: () => void
}

export default function EntityModal({ isOpen, onClose, entity, onSuccess }: EntityModalProps) {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [bankName, setBankName] = useState('')
    const [bankCode, setBankCode] = useState('')
    const [bankAccount, setBankAccount] = useState('')
    const [iban, setIban] = useState('')
    const [swift, setSwift] = useState('')
    const [nif, setNif] = useState('')
    const [poBox, setPoBox] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (entity) {
            setName(entity.name)
            setCode(entity.code || '')
            setAddress(entity.address || '')
            setPhone(entity.phone || '')
            setBankName(entity.bankName || '')
            setBankCode(entity.bankCode || '')
            setBankAccount(entity.bankAccount || '')
            setIban(entity.iban || '')
            setSwift(entity.swift || '')
            setNif(entity.nif || '')
            setPoBox(entity.poBox || '')
        } else {
            setName('')
            setCode('')
            setAddress('')
            setPhone('')
            setBankName('')
            setBankCode('')
            setBankAccount('')
            setIban('')
            setSwift('')
            setNif('')
            setPoBox('')
            setLogoFile(null)
        }
        setLogoFile(null)
    }, [entity, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        if (name) formData.append('name', name)
        if (code) formData.append('code', code)
        if (address) formData.append('address', address)
        if (phone) formData.append('phone', phone)
        if (bankName) formData.append('bankName', bankName)
        if (bankCode) formData.append('bankCode', bankCode)
        if (bankAccount) formData.append('bankAccount', bankAccount)
        if (iban) formData.append('iban', iban)
        if (swift) formData.append('swift', swift)
        if (nif) formData.append('nif', nif)
        if (poBox) formData.append('po_box', poBox)

        if (logoFile) {
            formData.append('logo', logoFile)
        }

        try {
            if (entity) {
                await api.put(`/entities/${entity.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Entité mise à jour')
            } else {
                await api.post('/entities', formData, {
                   headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Entité créée')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error(error)
            const message = error.response?.data?.message || "Erreur lors de l'enregistrement"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!entity) return
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité ?')) return
        
        setLoading(true)
        try {
            await api.delete(`/entities/${entity.id}`)
            toast.success('Entité supprimée')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error("Impossible de supprimer cette entité")
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                            {entity ? 'Modifier l\'Entité' : 'Nouvelle Entité'}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {entity ? 'Mettez à jour les informations légales.' : 'Configurez une nouvelle filiale ou société.'}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* General Info */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Informations Générales</h4>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'Entité <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                                                        placeholder="Ex: Valora"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Entité (6 car. max) <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={6}
                                                        value={code}
                                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                                                        placeholder="Ex: VALORA"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logo Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo de l'Entité</label>
                                            <div className="flex items-center gap-4">
                                                {(logoFile || entity?.logo) && (
                                                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-gray-200">
                                                        <img 
                                                            src={logoFile ? URL.createObjectURL(logoFile) : getStorageUrl(entity?.logo)} 
                                                            alt="Logo preview" 
                                                            className="h-full w-full object-contain p-1"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                if (file.size > 2 * 1024 * 1024) { // 2MB
                                                                    toast.error("Le fichier est trop volumineux. Max 2MB.")
                                                                    e.target.value = '' // Clear input
                                                                    setLogoFile(null)
                                                                    return
                                                                }
                                                                setLogoFile(file)
                                                            }
                                                        }}
                                                        className="block w-full text-sm text-gray-500
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-full file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-indigo-50 file:text-indigo-700
                                                            hover:file:bg-indigo-100
                                                        "
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG jusqu'à 2MB. Recommandé : fond transparent.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse Complète</label>
                                            <input
                                                type="text"
                                                placeholder="123 Avenue..."
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                                            <input
                                                type="text"
                                                placeholder="+33 1 23 45 67 89"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
 
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-1">NIF</label>
                                             <input
                                                 type="text"
                                                 placeholder="NIF..."
                                                 className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                 value={nif}
                                                 onChange={(e) => setNif(e.target.value)}
                                             />
                                         </div>
 
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-1">Boîte Postale (BP)</label>
                                             <input
                                                 type="text"
                                                 placeholder="BP..."
                                                 className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                 value={poBox}
                                                 onChange={(e) => setPoBox(e.target.value)}
                                             />
                                         </div>

                                        {/* Bank Details */}
                                        <div className="md:col-span-2 mt-4">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Coordonnées Bancaires</h4>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la Banque</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: BGFI Bank"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Code Banque</label>
                                            <input
                                                type="text"
                                                placeholder="Code"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                value={bankCode}
                                                onChange={(e) => setBankCode(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de Compte</label>
                                            <input
                                                type="text"
                                                placeholder="XXXXXXXXXXX"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50"
                                                value={bankAccount}
                                                onChange={(e) => setBankAccount(e.target.value)}
                                            />
                                        </div>

                                         <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">IBAN</label>
                                            <input
                                                type="text"
                                                placeholder="GA70..."
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50 font-mono"
                                                value={iban}
                                                onChange={(e) => setIban(e.target.value)}
                                            />
                                        </div>

                                         <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">SWIFT / BIC</label>
                                            <input
                                                type="text"
                                                placeholder="BGFIGALA"
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-gray-50/50 font-mono"
                                                value={swift}
                                                onChange={(e) => setSwift(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            {entity && (
                                                <Button type="button" variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={handleDelete} isLoading={loading}>
                                                   <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                   Supprimer
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
                                            <Button type="submit" isLoading={loading} className="px-6">{entity ? 'Enregistrer' : 'Créer l\'entité'}</Button>
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
