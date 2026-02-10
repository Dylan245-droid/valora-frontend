import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from './ui/Button'
import api from '../api/client'
import toast from 'react-hot-toast'

interface QuoteUploadModalProps {
    isOpen: boolean
    onClose: () => void
    requestId: number
    onSuccess: () => void
}

export default function QuoteUploadModal({ isOpen, onClose, requestId, onSuccess }: QuoteUploadModalProps) {
    const [supplierName, setSupplierName] = useState('')
    const [amount, setAmount] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    interface QuoteItem {
        description: string
        quantity: number
    }

    const [items, setItems] = useState<QuoteItem[]>([])

    if (!isOpen) return null

    // Update amount when items change (optional, or just use as reference)
    // Actually, user might want to set amount independently (e.g. tax included)
    // Let's just calculate sum for display.

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !supplierName || !amount) {
            toast.error('Veuillez remplir tous les champs obligatoires')
            return
        }

        // Validate at least one article with quantity >= 1
        if (items.length === 0) {
            toast.error('Veuillez ajouter au moins un article')
            return
        }

        const invalidItem = items.find(item => !item.description.trim() || item.quantity < 1)
        if (invalidItem) {
            toast.error('Chaque article doit avoir une description et une quantité supérieure ou égale à 1')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('supplierName', supplierName)
        formData.append('amount', amount)
        formData.append('file', file)
        
        // Pass items as JSON string because FormData handles strings/files
        if (items.length > 0) {
            formData.append('items', JSON.stringify(items))
        }

        try {
            await api.post(`/purchase-requests/${requestId}/quotes`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Devis ajouté avec succès')
            onSuccess()
            onClose()
            setSupplierName('')
            setAmount('')
            setFile(null)
            setItems([])
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'ajout du devis")
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
                            enter="ease-out duration-500"
                            enterFrom="opacity-0 scale-95 translate-y-8"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-300"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-8"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl shadow-indigo-500/10 transition-all border border-gray-100">
                                <div className="px-10 py-10 border-b border-gray-100 flex justify-between items-start bg-white relative overflow-hidden">
                                     <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12" />
                                     <div className="relative z-10">
                                        <Dialog.Title as="h3" className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                                            Ajouter un Devis
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-400 font-medium mt-1">
                                            Téléversez la proforma reçue du fournisseur.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="relative z-10 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-gray-100 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Fournisseur</label>
                                        <input 
                                            type="text" 
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                            value={supplierName}
                                            onChange={(e) => setSupplierName(e.target.value)}
                                            placeholder="Ex: Orange Business"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Montant Total (FCFA)</label>
                                        <input 
                                            type="number" 
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-gray-50/50 focus:bg-white transition-colors"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fichier (PDF/Image)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        <span>Téléverser un fichier</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept=".pdf,.png,.jpg,.jpeg" required />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {file ? file.name : "PDF, PNG, JPG jusqu'à 10MB"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                                            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Détails de la commande (Articles)</label>
                                            <Button type="button" variant="outline" onClick={addItem} className="text-xs py-1 px-3">
                                                + Ajouter un article
                                            </Button>
                                        </div>
                                        
                                        {items.length === 0 && (
                                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 italic">
                                                Aucun article spécifié. Le Bon de Commande utilisera les articles de la demande initiale.
                                            </div>
                                        )}

                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                            {items.map((item, index) => (
                                                <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                    <div className="flex-grow">
                                                        <input
                                                            type="text"
                                                            placeholder="Description (ex: Laptop Dell XPS 15)"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <input
                                                            type="number"
                                                            placeholder="Qté"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2 text-center"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                            min="1"
                                                            required
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {items.length > 0 && (
                                            <div className="text-right text-sm font-bold text-gray-700">
                                                Total Articles: {items.length}
                                            </div>
                                        )}
                                    </div>

                                <div className="px-10 py-8 bg-gray-50/30 flex justify-end gap-4 mt-4">
                                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold text-gray-500 border-gray-200">
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={loading} className="rounded-xl px-10 shadow-xl shadow-indigo-600/20 bg-indigo-600 font-bold">
                                            {loading ? 'Envoi...' : 'Ajouter le Devis'}
                                        </Button>
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
