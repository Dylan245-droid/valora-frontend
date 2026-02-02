import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast, { Toaster } from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/login', { email, password })
      const { token, user } = response.data
      
      login(token, user)
      toast.success(`Bienvenue ${user.fullName}!`)
      navigate('/')
    } catch (error: any) {
      console.error(error)
      toast.error('Identifiants invalides')
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
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <Card className="w-full max-w-sm p-6 sm:p-8 relative z-10 shadow-2xl border-white/60">
            <div className="text-center mb-6">
                <div className="h-14 w-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/10 mb-4 border border-indigo-50 overflow-hidden p-1.5 transform -rotate-2 hover:rotate-0 transition-all duration-500">
                    <img src="/branding/logo.png" alt="OKIVEL" className="h-full w-full object-contain" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Bon retour
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Saisissez vos identifiants pour accéder à votre espace.
                </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium leading-6 text-gray-900 mb-1">Adresse email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow bg-gray-50/50 focus:bg-white"
                            placeholder="vous@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-xs font-medium leading-6 text-gray-900 mb-1">Mot de passe</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow bg-gray-50/50 focus:bg-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-900">
                            Se souvenir de moi
                        </label>
                    </div>

                    <div className="text-xs">
                        <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </div>

                <Button type="submit" className="w-full" size="md" isLoading={loading}>
                    Se connecter
                </Button>
            </form>
        </Card>
    </div>
  )
}
