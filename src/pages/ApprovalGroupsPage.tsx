import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import type { ApprovalGroup } from '../types/auth'
import toast from 'react-hot-toast'
import ApprovalGroupModal from '../components/ApprovalGroupModal'
import ApprovalGroupCard from '../components/ui/ApprovalGroupCard'

export default function ApprovalGroupsPage() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState<ApprovalGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | undefined>(undefined)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const response = await api.get('/approval-groups')
            setGroups(response.data)
        } catch (error) {
            toast.error('Impossible de charger les groupes')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setSelectedGroup(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (group: ApprovalGroup) => {
        setSelectedGroup(group)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if(!confirm('Êtes-vous sûr ? Supprimer un groupe peut affecter les utilisateurs qui y sont assignés (ils perdront leur limite).')) return
        try {
            await api.delete(`/approval-groups/${id}`)
            setGroups(groups.filter(g => g.id !== id))
            toast.success('Groupe supprimé')
        } catch (error) {
            toast.error('Échec de la suppression du groupe')
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Groupes d'Approbation</h1>
                    <p className="mt-1 text-gray-400 text-sm font-medium">Définissez les circuits de décision et plafonds budgétaires.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Vue Grille"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Vue Liste"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>

                    <button 
                        onClick={handleCreate} 
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-bold text-sm"
                    >
                        Ajouter un Groupe
                    </button>
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                         {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>)}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Aucun groupe</h3>
                        <p className="mt-1 text-sm text-gray-500">Créez des groupes d'approbation pour définir des limites de dépenses.</p>
                     </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                         {groups.map(group => (
                            <ApprovalGroupCard
                                key={group.id}
                                group={group}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Niveau</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Intervalle (FCFA)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Portée</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {groups.map(group => (
                                    <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{group.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold w-fit">
                                                Niveau {group.level}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 font-medium">
                                                {new Intl.NumberFormat('fr-FR').format(group.minAmount)} - {new Intl.NumberFormat('fr-FR').format(group.maxAmount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.scope === 'GLOBAL' ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                {group.scope === 'GLOBAL' ? '🌍 Globale' : '🏢 Locale'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(group)} className="text-indigo-600 hover:text-indigo-900 font-bold mr-4">Modifier</button>
                                            <button onClick={() => handleDelete(group.id)} className="text-rose-600 hover:text-rose-900 font-bold">Supprimer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ApprovalGroupModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchGroups}
                group={selectedGroup}
            />
        </div>
    )
}
