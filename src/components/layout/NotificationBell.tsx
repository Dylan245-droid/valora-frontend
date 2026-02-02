import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { useNotifications, type Notification } from '../../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, isPushSupported, isSubscribed, permission, requestPermission } = useNotifications()

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
                             <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="bg-white p-4">
                                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                        <div className="flex gap-2">
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={() => markAsRead('all')}
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Tout marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                     {/* Push Permission Request */}
                                    {!isSubscribed && isPushSupported && (
                                        <div className="mb-4 bg-indigo-50 p-3 rounded-md flex items-center justify-between">
                                            <span className="text-xs text-indigo-700">
                                                {permission === 'denied' 
                                                    ? 'Notifications bloquées par le navigateur' 
                                                    : 'Activer les notifications push ?'}
                                            </span>
                                            {permission !== 'denied' && (
                                                <button 
                                                    onClick={requestPermission}
                                                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                                >
                                                    Activer
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="max-h-80 overflow-y-auto space-y-4">
                                        {!notifications || notifications.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">Aucune notification</p>
                                        ) : (
                                            notifications.map((notification: Notification) => (
                                                <div 
                                                    key={notification.id} 
                                                    onClick={() => {
                                                        if (!notification.readAt) markAsRead([notification.id])
                                                        // Navigate logic could be here (using useNavigate)
                                                    }}
                                                    className={`relative flex gap-x-4 rounded-md p-2 hover:bg-gray-50 cursor-pointer ${!notification.readAt ? 'bg-indigo-50/40' : ''}`}
                                                >
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${!notification.readAt ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{notification.body}</p>
                                                        <p className="mt-1 text-[10px] text-gray-400">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                                                        </p>
                                                    </div>
                                                    {!notification.readAt && (
                                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 mt-2" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                             </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
