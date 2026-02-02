import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import toast, { Toaster } from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/forgot-password', { email })
            // Always show success to prevent email enumeration
            setSubmitted(true)
            toast.success('Si cet email existe, un lien a été envoyé.')
        } catch (error) {
            console.error(error)
            toast.error("Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-50">
            <Toaster position="top-center" />
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <Card className="w-full max-w-md p-8 sm:p-10 relative z-10 shadow-2xl border-white/60">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 bg-indigo-100 rounded-xl mx-auto flex items-center justify-center mb-4 text-indigo-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Mot de passe oublié
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {!submitted ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">Adresse email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow bg-gray-50/50 focus:bg-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                            Envoyer le lien
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm">
                            Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
                        </div>
                        {import.meta.env.DEV && (
                            <p className="text-xs text-slate-500">
                                 (Mode développement : l'email est envoyé via votre config SMTP)
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour à la connexion
                    </Link>
                </div>
            </Card>
        </div>
    )
}
