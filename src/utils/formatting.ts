export const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En Attente',
    PROCESSING: 'En Traitement',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté',
    DRAFT: 'Brouillon'
}

export const STAGE_LABELS: Record<string, string> = {
    NEED: 'Expression de Besoin',
    SOURCING: 'Sourcing & Devis',
    VALIDATION: 'Validation & Commande',
    PENDING_PAYMENT: 'Paiement en Attente',
    INVOICED: 'Facturé & Payé'
}

export const getStatusLabel = (status: string) => STATUS_LABELS[status] || status
export const getStageLabel = (stage: string) => STAGE_LABELS[stage] || stage

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount)
}
