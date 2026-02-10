import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord Admin</h1>
        <p className="text-indigo-500 font-semibold mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Supervision du Groupe — {user?.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Card */}
        <Card 
            onClick={() => navigate('/admin/users')}
            className="p-10 cursor-pointer group hover:border-indigo-200 shadow-sm border-gray-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden rounded-3xl group"
        >
            <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Utilisateurs</h2>
                <p className="text-gray-400 font-medium mb-10 flex-1 leading-relaxed text-sm">Gérez les accès, rôles et affectations de vos collaborateurs au sein des entités.</p>
                <div className="flex items-center text-indigo-600 font-bold text-sm tracking-wide group-hover:translate-x-3 transition-transform duration-300">
                    CONFIGURER <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Card>

        {/* Group Management Card */}
        <Card 
            onClick={() => navigate('/admin/groups')}
            className="p-10 cursor-pointer group hover:border-emerald-200 shadow-sm border-gray-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden rounded-3xl"
        >
            <div className="absolute right-0 top-0 h-32 w-32 bg-emerald-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-emerald-200 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Approbations</h2>
                <p className="text-gray-400 font-medium mb-10 flex-1 leading-relaxed text-sm">Définissez les plafonds de validation et les circuits d'approbation multiniveaux.</p>
                <div className="flex items-center text-emerald-600 font-bold text-sm tracking-wide group-hover:translate-x-3 transition-transform duration-300">
                    CONFIGURER <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Card>

        {/* Analytics Card */}
        <Card 
            onClick={() => navigate('/admin/analytics')}
            className="p-10 cursor-pointer group hover:border-purple-200 shadow-sm border-gray-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 relative overflow-hidden rounded-3xl"
        >
            <div className="absolute right-0 top-0 h-32 w-32 bg-purple-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="h-16 w-16 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Analyses</h2>
                <p className="text-gray-400 font-medium mb-10 flex-1 leading-relaxed text-sm">Analysez les flux de dépenses et la performance opérationnelle de votre organisation.</p>
                <div className="flex items-center text-purple-600 font-bold text-sm tracking-wide group-hover:translate-x-3 transition-transform duration-300">
                    CONSULTER <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Card>

        {/* Organization Card */}
        <Card 
            onClick={() => navigate('/admin/organization')}
            className="p-10 cursor-pointer group hover:border-orange-200 shadow-sm border-gray-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 relative overflow-hidden rounded-3xl"
        >
            <div className="absolute right-0 top-0 h-32 w-32 bg-orange-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="h-16 w-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-orange-200 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Organisation</h2>
                <p className="text-gray-400 font-medium mb-10 flex-1 leading-relaxed text-sm">Structurez votre groupe : Entités (Filiales) et Services (Départements).</p>
                <div className="flex items-center text-orange-600 font-bold text-sm tracking-wide group-hover:translate-x-3 transition-transform duration-300">
                    GÉRER <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Card>

        {/* Analytical Settings Card */}
        <Card 
            onClick={() => navigate('/admin/analytical-settings')}
            className="p-10 cursor-pointer group hover:border-indigo-200 shadow-sm border-gray-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden rounded-3xl"
        >
            <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Codes Analytiques</h2>
                <p className="text-gray-400 font-medium mb-10 flex-1 leading-relaxed text-sm">Gérez les axes analytiques : Codes Généraux, Spécifiques et Identitaires.</p>
                <div className="flex items-center text-indigo-600 font-bold text-sm tracking-wide group-hover:translate-x-3 transition-transform duration-300">
                    CONFIGURER <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Card>
      </div>
    </div>
  )
}
