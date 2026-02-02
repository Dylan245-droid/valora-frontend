import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { type User } from '../types/auth'
import toast from 'react-hot-toast'
import UserModal from '../components/UserModal'
import ImportUsersModal from '../components/ImportUsersModal'
import UserCard from '../components/ui/UserCard'
import { getStorageUrl } from '../utils/config'

export default function UsersPage() {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
    const [view, setView] = useState<'grid' | 'table'>('grid')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users')
            setUsers(response.data)
        } catch (error) {
            toast.error('Impossible de charger les utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setSelectedUser(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if(!confirm('Êtes-vous sûr ?')) return
        try {
            await api.delete(`/users/${id}`)
            setUsers(users.filter(u => u.id !== id))
            toast.success('Utilisateur supprimé')
        } catch (error) {
            toast.error('Échec de la suppression de l\'utilisateur')
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                     <button 
                        onClick={() => navigate('/admin')}
                        className="group flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                    >
                        <svg className="mr-1.5 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Retour au TDB
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestion des Utilisateurs</h1>
                    <p className="mt-1 text-gray-400 text-sm font-medium">Administrez les rôles et permissions de vos collaborateurs.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            const headers = ['Nom', 'Prénom', 'Email', 'Rôle', 'Entité', 'Service', 'Groupe', 'Date de Naissance', 'Lieu de Naissance']
                            const csvContent = [
                                headers.join(','),
                                ...users.map(u => {
                                    const parts = u.fullName?.split(' ') || []
                                    const lastName = parts.length > 1 ? parts.pop() : '' // Simple heuristic
                                    const firstName = parts.join(' ')
                                    
                                    return [
                                        `"${lastName}"`,
                                        `"${firstName}"`,
                                        `"${u.email}"`,
                                        `"${u.role}"`,
                                        `"${u.department?.entity?.name || ''}"`,
                                        `"${u.department?.name || ''}"`,
                                        `"${u.approvalGroup?.name || ''}"`,
                                        `"${u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : ''}"`,
                                        `"${u.placeOfBirth || ''}"`
                                    ].join(',')
                                })
                            ].join('\n')

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.setAttribute('download', `utilisateurs_export_${new Date().toISOString().split('T')[0]}.csv`)
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm font-bold text-sm"
                    >
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Exporter
                    </button>
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm font-bold text-sm"
                    >
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Importer Excel
                    </button>
                    <button 
                        onClick={handleCreate} 
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-bold text-sm"
                    >
                        Ajouter un utilisateur
                    </button>
                </div>
            </div>



            {/* View Toggle */}
            <div className="flex justify-end mb-6">
                 <div className="bg-gray-100 p-1 rounded-xl flex">
                     <button
                        onClick={() => setView('grid')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                     </button>
                     <button
                        onClick={() => setView('table')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                     </button>
                 </div>
            </div>

            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                         {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>)}
                    </div>
                ) : users.length === 0 ? (
                     <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Aucun utilisateur</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des utilisateurs à votre organisation.</p>
                     </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                        {users.map(user => (
                            <UserCard 
                                key={user.id} 
                                user={user} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm mb-12">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entité</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Département</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Naissance</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden">
                                                    {user.avatarUrl ? (
                                                        <img 
                                                            src={getStorageUrl(user.avatarUrl)} 
                                                            alt={user.fullName || ''} 
                                                            className="h-full w-full object-cover" 
                                                        />
                                                    ) : (
                                                        user.fullName?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                                  user.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-800' : 
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {user.department?.entity?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.department?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.dateOfBirth ? (
                                                <div className="flex flex-col">
                                                    <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                                                    <span className="text-xs text-gray-400">{user.placeOfBirth}</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 p-1 bg-indigo-50 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="text-rose-600 hover:text-rose-900 p-1 bg-rose-50 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            
            </div>
            
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchUsers}
                user={selectedUser}
            />

            <ImportUsersModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    )
}
