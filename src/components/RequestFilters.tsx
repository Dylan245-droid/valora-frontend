import { useState } from 'react'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { formatDate, getStatusLabel, getStageLabel } from '../utils/export'

interface RequestProps {
  id: number;
  title: string;
  status: string;
  totalEstimatedAmount: number | null;
  createdAt: string;
  user?: {
      fullName: string | null;
      department?: {
          name: string;
          entity?: {
              name: string;
          }
      }
  };
  stage?: string;
  invoiceNumber?: string | null;
  invoiceReceivedAt?: string | null;
  paymentDueAt?: string | null;
  downPaymentAmount?: number;
  // other fields as needed for export
  [key: string]: any; 
}

interface RequestFiltersProps {
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onDeptChange: (value: string) => void
    onDateRangeChange: (start: string, end: string) => void
    onViewChange: (view: 'grid' | 'table') => void
    viewMode: 'grid' | 'table'
    departments: string[]
    requestsToExport: RequestProps[]
    showDeptFilter?: boolean
}

export default function RequestFilters({ 
    onSearchChange, 
    onStatusChange, 
    onDeptChange, 
    onDateRangeChange,
    onViewChange,
    viewMode,
    departments,
    requestsToExport,
    showDeptFilter = true 
}: RequestFiltersProps) {

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setStartDate(value)
            onDateRangeChange(value, endDate)
        } else {
            setEndDate(value)
            onDateRangeChange(startDate, value)
        }
    }

    const handleExport = () => {
        if (!requestsToExport || requestsToExport.length === 0) return

        // Format data for Excel
        // Format data for Excel
        const data = requestsToExport.map(r => ({
            Titre: r.title,
            Demandeur: r.user?.fullName || 'N/A',
            Entité: r.user?.department?.entity?.name || 'N/A',
            Service: r.user?.department?.name || 'N/A',
            Date: formatDate(r.createdAt),
            Montant: r.totalEstimatedAmount,
            Statut: getStatusLabel(r.status),
            Étape: getStageLabel(r.stage),
            'Numéro Facture': r.invoiceNumber || '',
            'Date Réception Facture': formatDate(r.invoiceReceivedAt),
            'Date Échéance': formatDate(r.paymentDueAt),
            'Code Général': r.analyticalCode?.activity?.project?.catalog?.code || r.analyticalCode?.project?.catalog?.code || '',
            'Code Spécifique': r.analyticalCode?.activity?.project?.code || r.analyticalCode?.project?.code || '',
            'Code Département': r.analyticalCode?.activity?.code || '',
            'Code Identitaire': r.analyticalCode?.code || ''
        }))

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Demandes")

        // Save File
        const fileName = `Export_Demandes_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`
        XLSX.writeFile(wb, fileName)
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
            {/* Top Row: Search & View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="relative flex-1 w-full md:max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                            onClick={() => onViewChange('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Cartes"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => onViewChange('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Tableau"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        title="Exporter sur Excel"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Excel</span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Detailed Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                <select 
                    className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
                    onChange={(e) => onStatusChange(e.target.value)}
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="PENDING">En Attente</option>
                    <option value="PROCESSING">En Traitement</option>
                    <option value="APPROVED">Validées</option>
                    <option value="REJECTED">Rejetées</option>
                </select>

                {showDeptFilter && (
                    <select 
                        className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
                        onChange={(e) => onDeptChange(e.target.value)}
                    >
                        <option value="ALL">Tous les départements</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                )}

                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Du :</span>
                    <input 
                        type="date"
                        className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        value={startDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Au :</span>
                    <input 
                        type="date"
                        className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                    />
                </div>

                <div className="flex-1 md:text-right text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {requestsToExport.length} Résultat{requestsToExport.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    )
}
