import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

/**
 * Portal-based dropdown — renders at document.body so it's never clipped
 * by parent overflow:hidden containers (e.g. table wrappers).
 *
 * Usage:
 *   const triggerRef = useRef(null)
 *   <button ref={triggerRef} onClick={() => setOpen(true)}>...</button>
 *   {open && <DropdownMenu triggerRef={triggerRef} items={[...]} onClose={() => setOpen(false)} />}
 *
 * items: { label, icon?, onClick?, variant?: 'danger', disabled?, separator? }
 */
export default function DropdownMenu({ items, onClose, triggerRef, align = 'right' }) {
  const menuRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 160 })

  // Calculate position from trigger button
  useEffect(() => {
    if (!triggerRef?.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 6,
      left: align === 'right' ? rect.right : rect.left,
      minWidth: Math.max(rect.width, 160),
    })
  }, [triggerRef, align])

  // Close on outside click or Escape
  useEffect(() => {
    function onMouseDown(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef?.current && !triggerRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, triggerRef])

  const style = {
    position: 'fixed',
    top: coords.top,
    ...(align === 'right'
      ? { right: window.innerWidth - coords.left }
      : { left: coords.left }),
    minWidth: coords.minWidth,
    zIndex: 9999,
  }

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className="py-1 rounded-lg border border-white/[0.09] bg-[#1a1a1a] shadow-2xl"
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 border-t border-white/[0.07]" />
        }
        return (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.()
                onClose()
              }
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] transition-colors duration-100',
              'disabled:opacity-35 disabled:cursor-not-allowed',
              item.variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/[0.08]'
                : 'text-white/65 hover:bg-white/[0.05] hover:text-white/85'
            )}
          >
            {item.icon && (
              <item.icon
                size={13}
                className={cn('shrink-0', item.variant === 'danger' ? 'text-red-400/70' : 'text-white/30')}
              />
            )}
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body
  )
}
