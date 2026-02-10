import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { useNotifications, type Notification } from '../../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRequestModal } from '../../context/RequestModalContext'

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, isPushSupported, isSubscribed, permission, requestPermission } = useNotifications()
    const { openRequest } = useRequestModal()

    return (
        <Popover className="relative">
            {({ }) => (
                <>
                    <Popover.Button className={`group -m-2.5 p-2.5 text-gray-500 hover:text-gray-900 focus:outline-none relative flex items-center gap-2`}>
                        <span className="sr-only">Voir les notifications</span>
                        <div className="relative">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white text-center leading-4 ring-2 ring-white">
                                    {unreadCount}
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
                                <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" /></svg>
                                                Notifications
                                            </h3>
                                            <p className="text-[10px] text-indigo-700 font-medium">Dernières alertes et actions</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => markAsRead('all')}
                                                className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 uppercase tracking-widest transition-colors whitespace-nowrap"
                                            >
                                                Tout lire
                                            </button>
                                        )}
                                    </div>
                                </div>

                                 {/* Push Permission Request */}
                                {!isSubscribed && isPushSupported && (
                                    <div className="p-3 border-b border-gray-100 bg-white">
                                        <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl flex items-center justify-between gap-3">
                                            <span className="text-xs text-indigo-800 font-medium">
                                                {permission === 'denied' 
                                                    ? 'Notifications bloquées par le navigateur' 
                                                    : 'Activer les notifications push ?'}
                                            </span>
                                            {permission !== 'denied' && (
                                                <button 
                                                    onClick={requestPermission}
                                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700"
                                                >
                                                    Activer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                                    {!notifications || notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-gray-500 italic">Aucune notification</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification: Notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => {
                                                    if (!notification.readAt) markAsRead([notification.id])
                                                    const requestId = notification.data?.requestId
                                                    if (typeof requestId === 'number') openRequest(requestId)
                                                }}
                                                className={`p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100 ${!notification.readAt ? 'bg-indigo-50/40' : ''}`}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="min-w-0">
                                                        <p className={`text-xs ${!notification.readAt ? 'font-bold text-gray-900' : 'text-gray-700 font-semibold'} line-clamp-1`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-gray-500 line-clamp-2">{notification.body}</p>
                                                    </div>
                                                    {!notification.readAt && (
                                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 mt-1" />
                                                    )}
                                                </div>
                                                <p className="mt-1 text-[10px] text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                             </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
