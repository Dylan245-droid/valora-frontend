import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client'
import type { PurchaseRequest } from '../types/request'
import RequestDetailModal from '../components/RequestDetailModal'

interface RequestModalContextType {
    openRequest: (id: number) => Promise<void>
}

const RequestModalContext = createContext<RequestModalContextType | undefined>(undefined)

export function useRequestModal() {
    const ctx = useContext(RequestModalContext)
    if (!ctx) throw new Error('useRequestModal must be used within a RequestModalProvider')
    return ctx
}

export function RequestModalProvider({ children }: { children: ReactNode }) {
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)

    const openRequest = async (id: number) => {
        try {
            const res = await api.get(`/purchase-requests/${id}`)
            setSelectedRequest(res.data)
            setIsOpen(true)
        } catch (e) {
            toast.error("Impossible de charger les détails de la demande")
        }
    }

    return (
        <RequestModalContext.Provider value={{ openRequest }}>
            {children}
            <RequestDetailModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                request={selectedRequest}
            />
        </RequestModalContext.Provider>
    )
}
