import api from './client'

export interface AnalyticalCatalog {
    id: number
    name: string
    code: string | null
    description: string | null
    entities?: { id: number, name: string }[]
}

export interface AnalyticalProject {
    id: number
    name: string
    code: string | null
    catalogId: number
    catalog?: AnalyticalCatalog
}

export interface AnalyticalActivity {
    id: number
    name: string
    code: string
    projectId: number
    project?: AnalyticalProject
}

export interface AnalyticalCode {
    id: number
    code: string
    label: string | null
    activityId: number | null
    projectId: number | null // Legacy
    activity?: AnalyticalActivity
    project?: AnalyticalProject & { catalog?: AnalyticalCatalog }
}

export const getAnalyticalCatalogs = async () => {
    const response = await api.get<AnalyticalCatalog[]>('/analytical/catalogs')
    return response.data
}

export const getAnalyticalProjects = async (catalogId: number) => {
    const response = await api.get<AnalyticalProject[]>(`/analytical/projects`, {
        params: { catalogId }
    })
    return response.data
}

export const getAnalyticalActivities = async (projectId: number) => {
    const response = await api.get<AnalyticalActivity[]>(`/analytical/activities`, {
        params: { projectId }
    })
    return response.data
}

export const getAnalyticalCodes = async (activityId: number) => {
    const response = await api.get<AnalyticalCode[]>(`/analytical/codes`, {
        params: { activityId }
    })
    return response.data
}
