import { format } from 'date-fns'

export const formatDate = (date: string | null | undefined) => {
    if (!date) return ''
    try {
        return format(new Date(date), 'dd/MM/yyyy')
    } catch (e) {
        return ''
    }
}

export const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING': return 'En Attente'
        case 'PROCESSING': return 'En Traitement'
        case 'APPROVED': return 'Validée'
        case 'REJECTED': return 'Rejetée'
        default: return status
    }
}

export const getStageLabel = (stage: string | undefined) => {
    switch (stage) {
        case 'NEED': return 'Besoin'
        case 'SOURCING': return 'Sourcing'
        case 'VALIDATION': return 'Validation'
        case 'PENDING_PAYMENT': return 'Paiement'
        case 'INVOICED': return 'Facturé & Payé' // Legacy/Simplification
        default: return stage || 'N/A'
    }
}
