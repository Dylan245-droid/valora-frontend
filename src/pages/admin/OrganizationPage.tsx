import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { Button } from '../../components/ui/Button'
import api from '../../api/client'
import toast from 'react-hot-toast'
import type { Entity, Department } from '../../types/organization'
import EntityModal from '../../components/admin/EntityModal'
import DepartmentModal from '../../components/admin/DepartmentModal'
import { useNavigate } from 'react-router-dom'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function OrganizationPage() {
    const navigate = useNavigate()
    const [entities, setEntities] = useState<Entity[]>([])
    const [departments, setDepartments] = useState<Department[]>([])

    const [isEntityModalOpen, setIsEntityModalOpen] = useState(false)
    const [selectedEntity, setSelectedEntity] = useState<Entity | undefined>(undefined)

    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
    const [selectedDept, setSelectedDept] = useState<Department | undefined>(undefined)

    const fetchAll = async () => {
        try {
            const [entRes, depRes] = await Promise.all([
                api.get('/entities'),
                api.get('/departments')
            ])
            setEntities(entRes.data)
            setDepartments(depRes.data)
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors du chargement des données")
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const openEntityModal = (entity?: Entity) => {
        setSelectedEntity(entity)
        setIsEntityModalOpen(true)
    }

    const openDeptModal = (dept?: Department) => {
        setSelectedDept(dept)
        setIsDeptModalOpen(true)
    }

    const handleDeleteDept = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return
        try {
            await api.delete(`/departments/${id}`)
            toast.success('Service supprimé')
            fetchAll()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleDeleteEntity = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité ? Attention, cela peut affecter les services liés.')) return
        try {
            await api.delete(`/entities/${id}`)
            toast.success('Entité supprimée')
            fetchAll()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }



    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                   <button 
                       onClick={() => navigate('/admin')}
                       className="group flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                   >
                       <svg className="mr-1.5 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                       Retour au tableau de bord
                   </button>
                   <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organisation</h1>
                   <p className="mt-2 text-gray-500 text-sm max-w-2xl">
                       Gérez la structure hiérarchique de votre groupe : configurez vos entités légales et répartissez les services opérationnels.
                   </p>
                </div>
                <div className="flex gap-3">
                     <Button 
                         variant="outline" 
                         onClick={() => fetchAll()}
                         className="hidden sm:flex"
                     >
                         Actualiser
                     </Button>
                </div>
            </div>

            <Tab.Group>
                <div className="flex justify-center mb-12">
                    <Tab.List className="flex space-x-1 rounded-full bg-white p-1 shadow-sm border border-gray-100 max-w-xl w-full">
                        {['Entités (Sociétés)', 'Services (Départements)'].map((category) => (
                            <Tab
                                key={category}
                                className={({ selected }) =>
                                    classNames(
                                        'flex-1 rounded-full py-2.5 text-sm font-bold transition-all duration-300',
                                        selected
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    )
                                }
                            >
                                {category}
                            </Tab>
                        ))}
                    </Tab.List>
                </div>

                <Tab.Panels>
                    {/* Entities Tab */}
                    <Tab.Panel className="focus:outline-none">
                        <div className="flex justify-end mb-8">
                             <Button 
                                onClick={() => openEntityModal()} 
                                className="rounded-xl px-6 py-6 shadow-xl shadow-indigo-500/20 bg-indigo-600 text-[15px] font-bold"
                             >
                                 <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                 Nouvelle Entité
                             </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {entities.map((entity) => (
                                <div key={entity.id} className="relative group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 overflow-hidden cursor-pointer" onClick={() => openEntityModal(entity)}>
                                    {/* Decorative UI blob from mockup */}
                                    <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                                    
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                         <div className="h-14 w-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
                                             {entity.name.charAt(0)}
                                         </div>
                                         <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEntity(entity.id); }}
                                                className="text-gray-300 hover:text-red-500 p-2 bg-gray-50 rounded-full transition-colors"
                                             >
                                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                             </button>
                                         </div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{entity.name}</h3>
                                        <p className="text-sm text-gray-400 mt-2 font-medium">{entity.address || 'Port-Gentil, Gabon'}</p>
                                        
                                        <div className="mt-10 flex items-center justify-between">
                                             <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                 Code: {entity.code || 'IEGH-2432'}
                                             </div>
                                             <span className="text-sm font-bold text-gray-600">{entity.departments?.length || 0} Services</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {entities.length === 0 && (
                                <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Pas encore d'entité</h3>
                                    <p className="mt-1 text-sm text-gray-500">Commencez par créer la structure de votre entreprise</p>
                                    <div className="mt-6">
                                      <Button onClick={() => openEntityModal()}>Créer une entité</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tab.Panel>

                    {/* Departments Tab */}
                    <Tab.Panel className="focus:outline-none">
                         <div className="flex justify-end mb-6">
                             <Button 
                                onClick={() => openDeptModal()}
                                className="shadow-lg shadow-indigo-500/20"
                             >
                                 <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                 Nouveau Service
                             </Button>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom du Service</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entité de rattachement</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date création</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {departments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                                                        {dept.name.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {dept.entity ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {dept.entity.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Non rattaché</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(dept.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openDeptModal(dept)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Éditer</button>
                                                <button onClick={() => handleDeleteDept(dept.id)} className="text-red-400 hover:text-red-600">Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {departments.length === 0 && (
                                         <tr>
                                             <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                                 Aucun service configuré pour le moment.
                                             </td>
                                         </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            <EntityModal 
                isOpen={isEntityModalOpen}
                onClose={() => setIsEntityModalOpen(false)}
                entity={selectedEntity}
                onSuccess={fetchAll}
            />

            <DepartmentModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                department={selectedDept}
                entities={entities}
                onSuccess={fetchAll}
            />
        </div>
    )
}
