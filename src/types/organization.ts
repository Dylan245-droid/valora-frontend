export interface Entity {
    id: number
    name: string
    code: string | null
    logo: string | null
    address: string | null
    phone: string | null
    bankName: string | null
    bankCode: string | null
    bankAccount: string | null
    iban: string | null
    swift: string | null
    nif: string | null
    poBox: string | null
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
