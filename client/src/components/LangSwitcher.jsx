import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'УК' },
]

export default function LangSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) ?? 'en'

  return (
    <div className={cn('inline-flex items-center p-0.5 rounded-md bg-white/[0.04] border border-white/[0.07]', className)}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={cn(
            'w-8 h-[22px] rounded text-[11px] font-medium transition-colors duration-100',
            current === code
              ? 'bg-white/[0.10] text-white/85'
              : 'text-white/35 hover:text-white/65'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
