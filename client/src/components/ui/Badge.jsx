import { cn } from '../../lib/utils'

const variants = {
  default:  'bg-white/[0.05] text-white/50 border-white/[0.08]',
  success:  'bg-green-500/10 text-green-400 border-green-500/20',
  danger:   'bg-red-500/10 text-red-400 border-red-500/20',
  warning:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  blue:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
