import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import PurchaseRequestForm from '../components/PurchaseRequestForm'

export default function CreateRequestPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      await api.post('/purchase-requests', data)
      toast.success('Demande créée avec succès !')
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Échec de la création de la demande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PurchaseRequestForm 
        onSubmit={handleSubmit} 
        loading={loading} 
        titleText="Nouvelle Expression de Besoin"
        submitText="Soumettre le besoin"
        showItems={false}
        showSidebar={false}
        showAttachments={false}
    />
  )
}
