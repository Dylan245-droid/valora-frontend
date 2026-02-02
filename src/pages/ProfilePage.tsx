import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { getStorageUrl } from '../utils/config'

export default function ProfilePage() {
    const { user, login } = useAuth() // login needed to refresh user context? Ideally specific 'refreshUser' or just update local
    // Actually AuthContext might not expose refresh. We might need to rely on next load or update manually?
    // Let's assume re-login isn't needed but updating context would be nice.
    // For now, simple form.
    
    const [fullName, setFullName] = useState(user?.fullName || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [avatar, setAvatar] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(user?.avatarUrl ? getStorageUrl(user.avatarUrl) : null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate() // Add hook

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '')
            if (user.avatarUrl) setPreview(getStorageUrl(user.avatarUrl))
        }
    }, [user])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 2 * 1024 * 1024) {
                 toast.error('L\'image ne doit pas dépasser 2 Mo')
                 return
            }
            setAvatar(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const removeAvatar = () => {
        setAvatar(null)
        setPreview(null) // Or revert to user.avatarUrl? User might want to Delete existing.
        // For now, let's assume 'remove' means clearing the current selection or clearing the current picture.
        // If they want to delete their existing avatar, we might need a separate flag or API support.
        // Let's assume this just clears the SELECTION for now, or if they have an existing one, maybe we keep it as preview?
        // Actually, "Regarde celle des pièces jointes" usually means "X" to remove the item from the list.
        // If I click X, I expect the avatar to go away or reset.
        // Let's reset to default (no avatar) for the form state.
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password && password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('fullName', fullName)
        if (password) formData.append('password', password)
        if (avatar) formData.append('avatar', avatar)
        // Note: Removing avatar via API isn't implemented yet (e.g. sending null).
        // For now, only updates are supported.

        try {
            const response = await api.post('/profile/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Profil mis à jour !')
            
            // Update Auth Context and Local Storage with new user data
            if (response.data) {
                const token = localStorage.getItem('token')
                if (token) {
                    login(token, response.data)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Échec de la mise à jour')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mb-10">
                 <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                >
                    <svg className="mr-1.5 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Retour
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Paramètres de profil</h1>
                <p className="mt-1 text-gray-400 font-medium">Gérez vos informations personnelles et votre sécurité.</p>
            </div>

            <div className="bg-white shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden border border-gray-100">
                <div className="px-8 py-8 bg-gray-50/50 border-b border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">Informations Personnelles</h3>
                        <p className="mt-1 text-sm text-gray-400 font-medium tracking-tight">Mettez à jour vos informations et votre photo.</p>
                    </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photo de profil</label>
                            <div className="mt-2 flex items-center gap-6">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 ring-4 ring-white shadow-sm">
                                        {preview ? (
                                            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                     <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/jpg"
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                            Modifier
                                        </Button>
                                        {avatar && (
                                            <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={removeAvatar}>
                                                Supprimer
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">JPG, GIF ou PNG. 2 Mo max.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6"></div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border transition-colors hover:border-gray-400"
                            />
                        </div>

                        {/* Email (Read only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Adresse Email</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6"></div>

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-8">
                            <Button type="submit" disabled={loading} className="rounded-xl px-8 py-6 shadow-xl shadow-indigo-500/20 bg-indigo-600 font-bold">
                                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
