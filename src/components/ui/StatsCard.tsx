import type { ReactNode } from 'react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: ReactNode
    trend?: {
        value: string
        type: 'up' | 'down' | 'neutral'
    }
    color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'green'
}

export function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
    }

    return (
        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]} shadow-inner`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">{title}</p>
                    <p className="text-2xl font-black tracking-tight text-gray-900 mt-0.5">{value}</p>
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className={`font-medium ${
                        trend.type === 'up' ? 'text-emerald-600' : 
                        trend.type === 'down' ? 'text-rose-600' : 'text-gray-600'
                    }`}>
                        {trend.value}
                    </span>
                    <span className="text-gray-400">par rapport au mois dernier</span>
                </div>
            )}
        </div>
    )
}
