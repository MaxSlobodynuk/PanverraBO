import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-white text-black hover:bg-white/90',
  secondary: 'bg-white/[0.06] text-white/70 hover:bg-white/10 border border-white/10',
  ghost: 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
}

const sizes = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-8 px-3.5 text-sm',
  lg: 'h-9 px-4 text-sm',
}

export default function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
        'transition-colors duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
