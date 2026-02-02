import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/client'
import toast, { Toaster } from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error("Jeton invalide ou manquant")
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas")
            return
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit faire au moins 6 caractères")
            return
        }

        setLoading(true)
        try {
            await api.post('/reset-password', { token, password })
            toast.success('Mot de passe réinitialisé avec succès !')
            setTimeout(() => navigate('/login'), 2000)
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || "Échec de la réinitialisation")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
         return (
             <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                 <Card className="max-w-md w-full p-8 text-center">
                     <p className="text-red-600 mb-4">Lien de réinitialisation invalide.</p>
                     <Link to="/login" className="text-indigo-600 hover:underline">Retour à la connexion</Link>
                 </Card>
             </div>
         )
    }

    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-50">
            <Toaster position="top-center" />
            <Card className="w-full max-w-md p-8 sm:p-10 relative z-10 shadow-2xl border-white/60">
                <div className="text-center mb-8">
                     <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Nouveau mot de passe
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">Nouveau mot de passe</label>
                        <input
                            type="password"
                            required
                            className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            required
                            className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                        Réinitialiser
                    </Button>
                </form>
            </Card>
        </div>
    )
}
