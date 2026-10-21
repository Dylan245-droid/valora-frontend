export interface Entity {
    id: string
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
    parentId?: string | null
    parent?: Entity | null
    children?: Entity[]
    departments?: Department[]
    createdAt: string
    updatedAt: string
}

export interface Department {
    id: string
    name: string
    entityId: string | null
    entity?: Entity
    createdAt: string
    updatedAt: string
}
