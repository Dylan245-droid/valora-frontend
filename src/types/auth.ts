export interface User {
    id: number
    email: string
    fullName: string | null
    role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'BUYER' | 'ACCOUNTANT'
    departmentId?: number
    department?: Department
    approvalGroupId?: number
    approvalGroup?: { id: number; name: string; minAmount: number; maxAmount: number; level: number }
    avatarUrl?: string | null
    dateOfBirth?: string | null
    placeOfBirth?: string | null
}

export interface Department {
    id: number
    name: string
    entityId: number
    entity?: {
        id: number
        name: string
        logo?: string
    }
}

export interface ApprovalGroup {
    id: number
    name: string
    minAmount: number
    maxAmount: number
    level: number
    scope: 'ENTITY' | 'GLOBAL'
}

export interface AuthResponse {
    type: string
    token: string
    user: User
}
