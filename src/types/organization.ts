export interface Entity {
    id: number
    name: string
    code: string | null
    logo: string | null
    address: string | null
    phone: string | null
    departments?: Department[]
    createdAt: string
    updatedAt: string
}

export interface Department {
    id: number
    name: string
    entityId: number | null
    entity?: Entity
    createdAt: string
    updatedAt: string
}
