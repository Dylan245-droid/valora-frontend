import type { ReactNode } from 'react'

export const Badge = ({ children, color = 'gray', className = '' }: { children: ReactNode, color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray' | 'purple' | 'indigo', className?: string }) => {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        gray: 'bg-slate-50 text-slate-600 ring-slate-500/10',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    }
    
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[color]} ${className}`}>
            {children}
        </span>
    )
}
