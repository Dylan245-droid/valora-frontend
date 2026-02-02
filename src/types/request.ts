export interface RequestAudit {
    id: number
    action: string
    details: any
    createdAt: string
    user?: { fullName: string; email: string }
}

export interface RequestAttachment {
    id: number
    fileName: string
    filePath: string
    fileType: string
    fileSize: number
    createdAt: string
}

export interface RequestApproval {
    id: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    approvedAt: string | null
    approvalGroup: {
        id: number
        name: string
    }
    approverId?: number
    approver?: {
        id: number
        fullName: string
    }
}

export interface Quote {
    id: number
    supplierName: string
    amount: number
    filePath?: string
    createdAt: string
}

export interface PurchaseRequest {
    id: number
    userId: number
    title: string
    description: string | null
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING'
    stage: 'NEED' | 'SOURCING' | 'VALIDATION' | 'PENDING_PAYMENT' | 'INVOICED'
    invoiceNumber?: string | null
    invoiceFilePath?: string | null
    invoiceReceivedAt?: string | null
    paymentDueAt?: string | null
    paidAt?: string | null
    downPayment?: number | null
    totalEstimatedAmount: number | null
    createdAt: string
    updatedAt: string
    user?: {
        fullName: string | null
        email: string
        avatarUrl?: string | null
        department?: {
            name: string
            entity?: {
                id: number
                name: string
                logo?: string
            }
        }
    }
    items: {
        description: string
        quantity: number
        unitPrice: number | null
        totalPrice?: number
    }[]
    audits?: RequestAudit[]
    attachments?: RequestAttachment[]
    requestApprovals?: RequestApproval[]
    quotes?: Quote[]
    selectedQuoteId?: number | null
    selectedQuote?: Quote
}
