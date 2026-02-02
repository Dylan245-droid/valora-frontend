import type { ReactNode } from 'react'
import Header from './Header'
import { Toaster } from 'react-hot-toast'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/30">
        <div className="w-full">
            <Header />
            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
                    {children}
                </div>
            </main>
            <Toaster position="top-right" />
        </div>
    </div>
  )
}
