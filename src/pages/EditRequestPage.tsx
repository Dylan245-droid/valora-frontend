import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import PurchaseRequestForm, { type Item } from '../components/PurchaseRequestForm'
import { type PurchaseRequest } from '../types/request'

export default function EditRequestPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<{ title: string; description: string; items: Item[] } | undefined>(undefined)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (id) fetchRequest(id)
  }, [id])

  const fetchRequest = async (requestId: string) => {
      try {
          // For MVP, filtering from all requests since we don't have a specific show endpoint yet
          const response = await api.get<PurchaseRequest[]>('/purchase-requests')
          const request = response.data.find(r => r.id === parseInt(requestId))
          
          if (request) {
              if (request.status !== 'PENDING') {
                  toast.error('Cette demande est verrouillée et ne peut pas être modifiée.')
                  navigate('/')
                  return
              }
              
              setInitialData({
                  title: request.title,
                  description: request.description || '',
                  items: request.items.map((i) => ({
                      description: i.description, // Correct mapping from API response items
                      quantity: i.quantity,
                      unitPrice: i.unitPrice || 0
                  }))
              })
          } else {
              toast.error('Demande introuvable')
              navigate('/')
          }

      } catch (error) {
          console.error(error)
          toast.error('Impossible de charger la demande')
      } finally {
          setFetching(false)
      }
  }

  const handleSubmit = async (data: { title: string; description: string; items: Item[] }) => {
    setLoading(true)
    try {
      await api.put(`/purchase-requests/${id}`, data)
      toast.success('Demande mise à jour avec succès !')
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Échec de la mise à jour de la demande')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-8">Chargement...</div>

  return (
    <PurchaseRequestForm 
        initialData={initialData}
        onSubmit={handleSubmit} 
        loading={loading} 
        titleText="Modifier la Demande d'Achat"
        submitText="Mettre à jour"
    />
  )
}
