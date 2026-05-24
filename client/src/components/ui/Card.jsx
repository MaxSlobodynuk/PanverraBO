import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-white/[0.08] bg-[#111111]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-white/[0.08]', className)}>
      {children}
    </div>
  )
}

export function CardContent({ className, children }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  )
}
