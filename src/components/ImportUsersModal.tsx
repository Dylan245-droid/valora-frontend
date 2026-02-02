import { Fragment, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../api/client'
import toast from 'react-hot-toast'

interface ImportUsersModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportUsersModal({ isOpen, onClose, onSuccess }: ImportUsersModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [results, setResults] = useState<{ processed: number, created: number, errors: string[] } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResults(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await api.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResults(response.data)
            if (response.data.created > 0) {
                toast.success(`${response.data.created} utilisateurs créés !`)
                onSuccess()
            } else {
                toast('Import terminé sans création', { icon: 'ℹ️' })
            }
        } catch (error) {
            console.error(error)
            toast.error('Échec de l\'import')
        } finally {
            setUploading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setResults(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        onClose()
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
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Importer des utilisateurs
                                </Dialog.Title>
                                
                                <div className="mt-4">
                                    {!results ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange} 
                                                    className="hidden" 
                                                    accept=".xlsx, .xls"
                                                />
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    {file ? (
                                                        <span className="font-semibold text-indigo-600">{file.name}</span>
                                                    ) : (
                                                        <span>Cliquez pour sélectionner un fichier Excel (.xlsx)</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Colonnes requises: Nom, Prénom, Email, Service, Date de Naissance, Rôle</p>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    disabled={uploading}
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                                                    onClick={onClose}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!file || uploading}
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed items-center"
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Import en cours...
                                                        </>
                                                    ) : 'Importer'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-start">
                                                <svg className="h-6 w-6 text-emerald-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <h4 className="font-bold">Import terminé</h4>
                                                    <p className="text-sm mt-1">Lignes traitées : {results.processed}</p>
                                                    <p className="text-sm">Utilisateurs créés : {results.created}</p>
                                                </div>
                                            </div>

                                            {results.errors.length > 0 && (
                                                <div className="bg-red-50 text-red-800 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
                                                    <h5 className="font-bold mb-2 flex items-center">
                                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Erreurs ({results.errors.length})
                                                    </h5>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {results.errors.map((err, idx) => (
                                                            <li key={idx}>{err}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={reset}
                                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Fermer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
