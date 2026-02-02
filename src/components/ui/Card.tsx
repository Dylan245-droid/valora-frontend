import { type HTMLAttributes, forwardRef } from 'react'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}
    {...props}
  />
))
Card.displayName = 'Card'
