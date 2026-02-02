import { type User } from '../../types/auth'
import { getStorageUrl } from '../../utils/config'

interface UserCardProps {
    user: User
    onEdit: (user: User) => void
    onDelete: (id: number) => void
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    const roleColors: Record<string, string> = {
        ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        MANAGER: 'bg-purple-50 text-purple-700 border-purple-100',
        EMPLOYEE: 'bg-gray-50 text-gray-600 border-gray-100',
        BUYER: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        ACCOUNTANT: 'bg-teal-50 text-teal-700 border-teal-100',
    }

    const roleBadge = roleColors[user.role] || roleColors.EMPLOYEE

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 h-full hover:-translate-y-2">
            
            {/* Decorative UI blob from mockup */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50/50 rounded-bl-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500" />
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 shadow-sm overflow-hidden">
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
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{user.fullName}</h3>
                            <p className="text-xs text-gray-500 font-medium truncate max-w-[180px]">{user.email}</p>
                            {user.department?.entity && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                                    {user.department.entity.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 font-medium">Rôle</span>
                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadge}`}>
                             {user.role}
                         </span>
                     </div>
                     
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 font-medium">Service</span>
                         <span className="text-gray-900 font-semibold">{user.department?.name || '-'}</span>
                     </div>

                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 font-medium">Entité</span>
                         <span className="text-gray-900 font-semibold">{user.department?.entity?.name || '-'}</span>
                     </div>

                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 font-medium">Groupe</span>
                         <div className="text-right">
                            <div className="text-gray-900 font-semibold">{user.approvalGroup?.name || '-'}</div>
                            {user.approvalGroup && (
                                <div className="text-[10px] text-gray-400 font-mono">
                                    Max: {new Intl.NumberFormat('fr-FR').format(user.approvalGroup.maxAmount)}
                                </div>
                            )}
                         </div>
                     </div>
                </div>
            </div>

            <div className="mt-auto border-t border-gray-50 bg-gray-50/50 p-4 backdrop-blur-sm flex items-center justify-end gap-3 rounded-b-3xl">
                 <button 
                    onClick={() => onEdit(user)}
                    className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                 >
                    Modifier
                 </button>
                 <button 
                    onClick={() => onDelete(user.id)}
                    className="flex-1 rounded-xl bg-white border border-rose-100 text-rose-600 px-3 py-2.5 text-xs font-bold shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all"
                 >
                    Supprimer
                 </button>
            </div>
        </div>
    )
}
