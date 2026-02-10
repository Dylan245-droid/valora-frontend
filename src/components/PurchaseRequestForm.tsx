
import { Button } from './ui/Button'
import AnalyticalSelector from './AnalyticalSelector'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/Card'
import toast from 'react-hot-toast'
import { formatCurrency } from '../utils/formatting'

export interface Item {
  description: string
  quantity: number
  unitPrice?: number // Optional for need expression
}

interface PurchaseRequestFormProps {
  initialData?: {
    title: string
    description: string
    items: Item[]
  }
  onSubmit: (data: any) => Promise<void>
  loading: boolean
  titleText: string
  submitText: string
  showItems?: boolean
  showSidebar?: boolean
  showAttachments?: boolean
}

export default function PurchaseRequestForm({ 
    initialData, 
    onSubmit, 
    loading, 
    titleText, 
    submitText, 
    showItems = true,
    showSidebar = true,
    showAttachments = true
}: PurchaseRequestFormProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [items, setItems] = useState<Item[]>(initialData?.items || [{ description: '', quantity: 1, unitPrice: 0 }])
  const [total, setTotal] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [analyticalCodeId, setAnalyticalCodeId] = useState<number | null>(null)

  useEffect(() => {
    if (initialData) {
        setTitle(initialData.title)
        setDescription(initialData.description)
        setItems(initialData.items)
    }
  }, [initialData])

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0)
    setTotal(newTotal)
  }, [items])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setFiles([...files, ...Array.from(e.target.files)])
      }
  }

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (showItems && items.some(i => !i.description || i.quantity <= 0)) {
        toast.error('Veuillez remplir correctement la description et la quantité')
        return
    }

    const data: any = { title, description, analytical_code_id: analyticalCodeId }
    
    if (files.length > 0 && showAttachments) {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        if (analyticalCodeId) formData.append('analytical_code_id', analyticalCodeId.toString())
        
        if (showItems) {
            items.forEach((item, index) => {
                formData.append(`items[${index}][description]`, item.description)
                formData.append(`items[${index}][quantity]`, item.quantity.toString())
                formData.append(`items[${index}][unitPrice]`, (item.unitPrice || 0).toString())
            })
        }

        files.forEach((file) => {
            formData.append('attachments', file)
        })

        onSubmit(formData)
    } else {
        if (showItems) {
            data.items = items.map(i => ({...i, unitPrice: i.unitPrice || 0}))
        }
        onSubmit(data)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex-1">
             <button 
                onClick={() => navigate(-1)}
                className="group flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
            >
                <svg className="mr-1.5 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Annuler et Retour
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{titleText}</h1>
            <p className="text-gray-400 font-medium mt-1">Veuillez renseigner les détails avec précision pour faciliter la validation.</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          {/* Main Form */}
          <div className={`${showSidebar ? 'lg:col-span-2' : ''} space-y-6`}>
              <Card className="p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12" />
                 <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    Informations Générales
                 </h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la demande</label>
                        <input
                            type="text"
                            required
                            className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 focus:bg-white transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="ex: Nouveaux écrans de bureau"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Justification</label>
                        <textarea
                            rows={4}
                            className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 focus:bg-white transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Pourquoi cet achat est-il nécessaire ?"
                        />
                    </div>
                 </div>

                 <div className="mt-8 border-t border-gray-100 pt-6">
                    <AnalyticalSelector onCodeSelect={setAnalyticalCodeId} disabled={loading} />
                 </div>
              </Card>

              {/* Articles Card */}
              {showItems && (
                  <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Articles ({items.length})</h3>
                                    <p className="text-xs text-gray-500">Listez les biens ou services requis.</p>
                                </div>
                            </div>
                            <Button type="button" size="sm" onClick={addItem} className="rounded-xl shadow-sm bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200">
                                + Ajouter un article
                            </Button>
                        </div>
                        
                        <div className="p-8 space-y-4 bg-gray-50/30">
                            {items.map((item, index) => (
                                <div key={index} className="group relative bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="absolute -top-3 -right-3 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                        disabled={items.length === 1}
                                        title="Supprimer l'article"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Désignation</label>
                                            <input
                                                type="text"
                                                required
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="block w-full rounded-xl border-gray-200 py-2.5 px-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder:text-gray-300"
                                                placeholder="Ex: Ordinateur portable Dell XPS 15"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Qté</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="block w-full rounded-xl border-gray-200 py-2.5 px-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm tabular-nums"
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Prix Est. Unitaire (FCFA)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    className="block w-full rounded-xl border-gray-200 py-2.5 px-3 pr-16 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm tabular-nums text-right font-medium"
                                                    placeholder="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-xs font-medium bg-gray-50 rounded-r-xl border-l border-gray-200 px-2 my-px h-[calc(100%-2px)]">
                                                    FCFA
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                  </div>
              )}

              {!showSidebar && (
                  <div className="flex justify-end mt-8">
                     <Button type="submit" className="w-full md:w-auto px-12 shadow-xl shadow-indigo-500/20" size="lg" isLoading={loading} onClick={handleSubmit}>
                        {submitText}
                     </Button>
                  </div>
              )}
          </div>

          {/* Sidebar Summary & Attachments */}
          {showSidebar && (
              <div className="space-y-6">
                <Card className="p-8 sticky top-24 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 h-32 w-32 bg-indigo-50/50 rounded-tl-full translate-x-12 translate-y-12" />
                    <h3 className="text-xl font-extrabold text-gray-900 mb-6 uppercase tracking-tight relative z-10">Résumé</h3>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                        <span className="text-gray-500">Nombre d'articles (Qté)</span>
                        <span className="font-medium">{items.reduce((acc, item) => acc + (item.quantity || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-gray-900 font-bold text-lg">Total Estimé</span>
                        <span className="text-indigo-600 font-bold text-xl">{formatCurrency(total)}</span>
                    </div>
                    
                    {showAttachments && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Pièces jointes</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                    <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple onChange={handleFileChange} />
                                    <div className="space-y-1 text-center pointer-events-none">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-indigo-600">Téléverser</span>
                                        </div>
                                        <p className="text-xs text-gray-500">jusqu'à 10MB</p>
                                    </div>
                                </div>

                                {files.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {files.map((file, index) => (
                                            <li key={index} className="flex items-center justify-between p-2 text-xs bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                                    className="text-red-500 hover:text-red-700 font-bold px-1"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                        </div>
                    )}

                    <div className="mt-8 relative z-10">
                        <Button type="submit" className="w-full shadow-xl shadow-indigo-500/20 rounded-xl px-8 py-7 bg-indigo-600 font-bold" size="lg" isLoading={loading} onClick={handleSubmit}>
                            {submitText}
                        </Button>
                    </div>
                </Card>
              </div>
          )}
      </div>
    </div>
  )
}
