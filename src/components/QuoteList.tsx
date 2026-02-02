import { type Quote } from '../types/request'
import { formatCurrency } from '../utils/formatting'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface QuoteListProps {
    quotes: Quote[]
    onSelect?: (quoteId: number) => void
    isSelectionEnabled?: boolean
    selectedQuoteId?: number | null
}

export default function QuoteList({ quotes, onSelect, isSelectionEnabled, selectedQuoteId }: QuoteListProps) {
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
                        
                        <div className="flex items-center gap-3">
                             {quote.filePath && (
                                 <a 
                                    href={`${import.meta.env.VITE_STORAGE_URL}${quote.filePath}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                 >
                                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                     </svg>
                                     Voir
                                 </a>
                            )}
                            
                            {isSelectionEnabled && onSelect && selectedQuoteId !== quote.id && (
                                <button
                                    onClick={() => onSelect(quote.id)}
                                    className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    Choisir
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
