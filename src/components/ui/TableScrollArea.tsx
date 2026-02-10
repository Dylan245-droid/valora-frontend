import type { ReactNode } from 'react'
import './TableScrollArea.css' // We will create this CSS file

export function TableScrollArea({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={`w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 pb-2 ${className || ''}`}>
            {children}
        </div>
    )
}
