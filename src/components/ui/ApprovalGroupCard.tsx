import { type ApprovalGroup } from '../../types/auth'

interface ApprovalGroupCardProps {
    group: ApprovalGroup
    onEdit: (group: ApprovalGroup) => void
    onDelete: (id: number) => void
}

export default function ApprovalGroupCard({ group, onEdit, onDelete }: ApprovalGroupCardProps) {
    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 h-full hover:-translate-y-2">
            
            {/* Decorative UI blob from mockup */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50/50 rounded-bl-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500" />

            <div className="p-8">
                <div className="flex items-center gap-5 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                         <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">{group.name}</h3>
                        <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-black mt-1">Niveau d'Autorité L{group.level}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Niveau</p>
                         <p className="text-xl font-black text-indigo-600">
                            L{group.level}
                         </p>
                    </div>
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plafond</p>
                         <p className="text-xl font-black text-gray-900">
                            {(group.maxAmount / 1000000).toFixed(1)}M
                         </p>
                    </div>
                </div>
                <div className="mt-4 bg-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-100 flex justify-between items-center text-white">
                     <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Intervalle de validation</p>
                     <p className="text-sm font-black">
                        {new Intl.NumberFormat('fr-FR').format(group.minAmount)} - {new Intl.NumberFormat('fr-FR').format(group.maxAmount)} <span className="text-[10px] opacity-70">FCFA</span>
                     </p>
                </div>
                
                <div className="mt-4 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${group.scope === 'GLOBAL' ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        Portée : {group.scope === 'GLOBAL' ? '🌍 Globale (Holding)' : '🏢 Locale (Entité)'}
                    </span>
                </div>
            </div>

            <div className="mt-auto border-t border-gray-50 bg-gray-50/50 p-4 backdrop-blur-sm flex items-center justify-end gap-3 rounded-b-3xl">
                 <button 
                    onClick={() => onEdit(group)}
                    className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                 >
                    Modifier
                 </button>
                 <button 
                    onClick={() => onDelete(group.id)}
                    className="flex-1 rounded-xl bg-white border border-rose-100 text-rose-600 px-3 py-2.5 text-xs font-bold shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all"
                 >
                    Supprimer
                 </button>
            </div>
        </div>
    )
}
