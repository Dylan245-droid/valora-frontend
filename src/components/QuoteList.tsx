import { type Quote } from '../types/request'
import { formatCurrency } from '../utils/formatting'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface QuoteListProps {
    quotes: Quote[]
    onSelect?: (quoteId: number) => void
    isSelectionEnabled?: boolean
    selectedQuoteId?: number | null
    onViewDetails?: (quote: Quote) => void
    onDelete?: (quoteId: number) => void
    canDelete?: boolean
}

export default function QuoteList({ quotes, onSelect, isSelectionEnabled, selectedQuoteId, onViewDetails, onDelete, canDelete }: QuoteListProps) {
    if (!quotes || quotes.length === 0) {
        return <div className="text-gray-500 text-sm italic py-4">Aucun devis disponible pour le moment.</div>
    }

    return (
        <div className="grid grid-cols-1 gap-4 mt-4">
            {quotes.map((quote) => (
                <div 
                    key={quote.id} 
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
                        selectedQuoteId === quote.id 
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-100' 
                        : 'border-gray-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1'
                    }`}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                             <div className={`h-10 w-10 flex items-center justify-center rounded-lg shadow-sm border ${selectedQuoteId === quote.id ? 'bg-emerald-100/50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             </div>
                             <div>
                                <span className="font-extrabold text-gray-900 block uppercase tracking-tight">{quote.supplierName}</span>
                                <span className="text-xs text-gray-500">
                                    Reçu le {format(new Date(quote.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </span>
                             </div>
                             {selectedQuoteId === quote.id && (
                                 <span className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ml-3 shadow-sm shadow-emerald-200">
                                     Sélectionné
                                 </span>
                             )}
                        </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(quote.amount)}</div>
                        
                        <div className="flex items-center gap-2">
                            {/* View Details Button */}
                            {onViewDetails && (
                                <button
                                    onClick={() => onViewDetails(quote)}
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Détails
                                </button>
                            )}

                            {/* File Link */}
                            {quote.filePath && (
                                <a 
                                    href={`${import.meta.env.VITE_STORAGE_URL}${quote.filePath}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors px-2 py-1.5"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    PDF
                                </a>
                            )}
                            
                            {/* Select Button */}
                            {isSelectionEnabled && onSelect && selectedQuoteId !== quote.id && (
                                <button
                                    onClick={() => onSelect(quote.id)}
                                    className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    Choisir
                                </button>
                            )}

                            {/* Delete Button - Only for buyers when no selection made */}
                            {canDelete && onDelete && selectedQuoteId !== quote.id && (
                                <button
                                    onClick={() => {
                                        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
                                            onDelete(quote.id)
                                        }
                                    }}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Supprimer ce devis"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

