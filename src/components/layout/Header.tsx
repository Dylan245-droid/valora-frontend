import NotificationBell from './NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { getStorageUrl } from '../../utils/config'
import { useNavigate } from 'react-router-dom'

export default function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-white/20 bg-white/60 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-indigo-100 shadow-sm overflow-hidden p-1">
                    <img src="/branding/logo.png" alt="OKIVEL" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight leading-none text-lg">OKIVEL</span>
                    <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase leading-none">Enterprise Edition</span>
                </div>
            </div>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
                <NotificationBell />
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {user && (
                         <Menu as="div" className="relative">
                            <Menu.Button className="-m-1.5 flex items-center p-1.5">
                                <span className="sr-only">Open user menu</span>
                                <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm overflow-hidden">
                                    {user.avatarUrl ? (
                                        <img 
                                            src={getStorageUrl(user.avatarUrl)} 
                                            alt={user.fullName || 'User'} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>{user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="hidden lg:flex lg:items-center">
                                    <div className="ml-4 text-right">
                                        <span className="block text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">{user.fullName}</span>
                                        <span className="block text-[10px] font-medium leading-none text-gray-500 uppercase tracking-wider">{user.role}</span>
                                    </div>
                                    <svg className="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-gray-900/5 focus:outline-none divide-y divide-gray-100">
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className={`
                                                        ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}
                                                        group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                                                    `}
                                                >
                                                    <svg className={`mr-3 h-5 w-5 ${active ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Mon Profil
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={logout}
                                                    className={`
                                                        ${active ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}
                                                        group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                                                    `}
                                                >
                                                    <svg className={`mr-3 h-5 w-5 ${active ? 'text-rose-500' : 'text-gray-400 group-hover:text-rose-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Se déconnecter
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    )}
                </div>
            </div>
        </div>
    )
}
