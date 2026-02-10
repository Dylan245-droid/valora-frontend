import { Fragment, useEffect, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from "../../api/client";
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatting'
import { useRequestModal } from '../../context/RequestModalContext'

interface UpcomingPayment {
    id: number
    title: string
    paymentDueAt: string
    totalEstimatedAmount: number
    user: {
        fullName: string
        department?: {
            name: string
        }
    }
}

export default function PaymentReminderBell() {
    const { user } = useAuth()
    const { openRequest } = useRequestModal()
    const [payments, setPayments] = useState<UpcomingPayment[]>([])
    const [loading, setLoading] = useState(false)

    const canSeeReminders = user?.role === 'BUYER' || user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN'

    useEffect(() => {
        if (canSeeReminders) {
            fetchPayments()
        }
    }, [canSeeReminders])

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/purchase-requests/upcoming-payments')
            setPayments(data)
        } catch (error) {
            console.error('Failed to fetch upcoming payments', error)
        } finally {
            setLoading(false)
        }
    }

    if (!canSeeReminders) return null

    const upcomingCount = payments.length

    return (
        <Popover className="relative">
            <Popover.Button className="group -m-2.5 p-2.5 text-gray-500 hover:text-orange-600 focus:outline-none relative flex items-center gap-2 transition-colors">
                <span className="sr-only">Échéances de paiement</span>
                <div className="relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {upcomingCount > 0 && (
                        <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold text-white text-center leading-4 ring-2 ring-white">
                            {upcomingCount}
                        </span>
                    )}
                </div>
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute right-0 z-50 mt-3 w-80 max-w-sm transform px-4 sm:px-0 lg:max-w-3xl">
                    <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 bg-white border border-gray-100">
                        <div className="p-4 bg-orange-50/50 border-b border-orange-100">
                            <h3 className="text-sm font-bold text-orange-900 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Échéances de Paiement
                            </h3>
                            <p className="text-[10px] text-orange-700 font-medium">Factures en attente de paiement final</p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin h-6 w-6 border-2 border-orange-500 rounded-full border-t-transparent mx-auto"></div>
                                </div>
                            ) : upcomingCount === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500 italic">Aucune échéance à venir</p>
                                </div>
                            ) : (
                                payments.map((payment) => {
                                    const daysLeft = differenceInDays(new Date(payment.paymentDueAt), new Date())
                                    const isOverdue = daysLeft < 0
                                    
                                    return (
                                        <div
                                            key={payment.id}
                                            onClick={() => openRequest(payment.id)}
                                            className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-1">{payment.title}</h4>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tight whitespace-nowrap ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {isOverdue ? 'En retard' : `J-${daysLeft}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end text-[10px]">
                                                <div className="text-gray-500">
                                                    <p className="font-medium text-gray-700">{payment.user.fullName}</p>
                                                    <p>{format(new Date(payment.paymentDueAt), 'dd MMM yyyy', { locale: fr })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(payment.totalEstimatedAmount)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}
