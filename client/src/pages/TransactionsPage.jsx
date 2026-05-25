import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, X, ChevronDown, ChevronUp, Percent, ChevronRight, Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DropdownMenu from '../components/ui/DropdownMenu'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import api from '../lib/api'

const CATEGORIES = [
  'Income', 'Developer Salary', 'Sales Commission', 'Payoneer Fee',
  'Taxes', 'AWS', 'Vercel', 'Domains', 'Marketing', 'Other',
]

const CATEGORY_VARIANT = {
  Income:             'success',
  'Developer Salary': 'default',
  'Sales Commission': 'blue',
  'Payoneer Fee':     'warning',
  Taxes:              'danger',
  AWS:                'default',
  Vercel:             'default',
  Domains:            'default',
  Marketing:          'warning',
  Other:              'default',
}

const INCOME_SUBTYPES = [
  { id: 'client_payment', labelKey: 'transactions.subtypeClientPayment' },
  { id: 'commission',     labelKey: 'transactions.subtypeCommission' },
  { id: 'other',          labelKey: 'transactions.subtypeOther' },
]

function normalizeTx(tx) {
  return {
    ...tx,
    deductionBreakdown: tx.deduction_breakdown ?? [],
    periodFrom:         tx.period_from   ?? null,
    periodTo:           tx.period_to     ?? null,
    grossAmount:        tx.gross_amount  ?? null,
    netAmount:          tx.net_amount    ?? null,
    hourlyRate:         tx.hourly_rate   ?? null,
  }
}

function DeductionsSection({ grossAmount, deductions, onChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const gross         = parseFloat(grossAmount) || 0
  const totalDeducted = deductions.filter((d) => d.enabled).reduce((s, d) => s + (gross * d.rate) / 100, 0)
  const net           = gross - totalDeducted
  const hasEnabled    = deductions.some((d) => d.enabled)

  function toggleDeduction(id) {
    onChange(deductions.map((d) => d.id === id ? { ...d, enabled: !d.enabled } : d))
  }

  function updateRate(id, raw) {
    const rate = Math.min(100, Math.max(0, parseFloat(raw) || 0))
    onChange(deductions.map((d) => d.id === id ? { ...d, rate } : d))
  }

  return (
    <div className={cn('rounded-lg border transition-colors', open || hasEnabled ? 'border-white/[0.12] bg-white/[0.02]' : 'border-white/[0.07]')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Percent size={12} className={cn('shrink-0', hasEnabled ? 'text-yellow-400' : 'text-white/30')} />
          <span className={cn('text-[12px] font-medium', hasEnabled ? 'text-white/75' : 'text-white/40')}>
            {t('deductions.title')}
          </span>
          {hasEnabled && (
            <span className="text-[11px] text-yellow-400/80 tabular-nums">
              −{formatCurrency(totalDeducted)}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={13} className="text-white/25" /> : <ChevronDown size={13} className="text-white/25" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-2">
          {deductions.map((d) => {
            const amount = gross > 0 ? (gross * d.rate) / 100 : 0
            return (
              <div key={d.id} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleDeduction(d.id)}
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                    d.enabled ? 'bg-white border-white' : 'border-white/20 hover:border-white/40'
                  )}
                >
                  {d.enabled && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={cn('flex-1 text-[12px]', d.enabled ? 'text-white/75' : 'text-white/40')}>
                  {d.label}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="0" max="100" step="0.1"
                    value={d.rate}
                    onChange={(e) => updateRate(d.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-14 h-7 px-2 text-right rounded text-[12px] tabular-nums bg-white/[0.04] border border-white/[0.08] text-white/70 focus:outline-none focus:border-white/25 transition-colors"
                  />
                  <span className="text-[11px] text-white/30">%</span>
                </div>
                <span className={cn('text-[12px] tabular-nums w-20 text-right', d.enabled ? 'text-red-400/80' : 'text-white/20')}>
                  {gross > 0 ? `−${formatCurrency(amount)}` : '—'}
                </span>
              </div>
            )
          })}

          {gross > 0 && hasEnabled && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-white/30">
                {t('deductions.gross')} <span className="text-white/60 tabular-nums">{formatCurrency(gross)}</span>
              </span>
              <span className="text-white/15">→</span>
              <span className="text-[11px] text-white/30">
                {t('deductions.fees')} <span className="text-red-400/70 tabular-nums">−{formatCurrency(totalDeducted)}</span>
              </span>
              <span className="text-white/15">→</span>
              <span className="text-[11px] text-white/30">
                {t('deductions.net')} <span className="text-green-400 font-semibold tabular-nums">{formatCurrency(net)}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HoursRateCalc({ hours, rate, onHoursChange, onRateChange }) {
  const { t } = useTranslation()
  const total = (parseFloat(hours) || 0) * (parseFloat(rate) || 0)

  return (
    <div className="rounded-lg border border-white/[0.09] bg-white/[0.02] p-3.5 space-y-3">
      <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider">
        {t('transactions.hoursRate')}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[10px] text-white/25 mb-1">{t('transactions.hours')}</p>
          <input
            type="number" min="0" step="0.5"
            value={hours}
            onChange={(e) => onHoursChange(e.target.value)}
            placeholder="0"
            className="w-full h-9 px-3 rounded-md text-[13px] tabular-nums bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
        <span className="text-white/20 mt-4 shrink-0">×</span>
        <div className="flex-1">
          <p className="text-[10px] text-white/25 mb-1">{t('transactions.ratePerHour')}</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/30">$</span>
            <input
              type="number" min="0" step="0.01"
              value={rate}
              onChange={(e) => onRateChange(e.target.value)}
              placeholder="0.00"
              className="w-full h-9 pl-6 pr-3 rounded-md text-[13px] tabular-nums bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
        </div>
        <span className="text-white/20 mt-4 shrink-0">=</span>
        <div className="flex-1">
          <p className="text-[10px] text-white/25 mb-1">{t('transactions.total')}</p>
          <div className={cn(
            'h-9 px-3 rounded-md text-[13px] font-semibold tabular-nums flex items-center border transition-colors',
            total > 0
              ? 'bg-green-500/[0.07] border-green-500/20 text-green-400'
              : 'bg-white/[0.03] border-white/[0.07] text-white/25'
          )}>
            {total > 0 ? formatCurrency(total) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose, onAddMany }) {
  const { t } = useTranslation()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })

  const { data: deductionPresets = [] } = useQuery({
    queryKey: ['settings/deductions'],
    queryFn: () => api.get('/settings/deductions').then((r) => r.data),
  })

  const [form, setForm] = useState({
    type:          'income',
    incomeSubtype: 'client_payment',
    description:   '',
    category:      'Income',
    amount:        '',
    date:          new Date().toISOString().slice(0, 10),
    projectId:     '',
    note:          '',
    periodFrom:    '',
    periodTo:      '',
    hours:         '',
    hourlyRate:    '',
  })

  const [deductions, setDeductions] = useState([])

  useEffect(() => {
    if (deductionPresets.length) {
      setDeductions(deductionPresets.map((d) => ({ ...d, enabled: false })))
    }
  }, [deductionPresets])

  const isIncome        = form.type === 'income'
  const isClientPayment = isIncome && form.incomeSubtype === 'client_payment'

  const computedAmount = isClientPayment
    ? ((parseFloat(form.hours) || 0) * (parseFloat(form.hourlyRate) || 0)) || ''
    : null

  const effectiveAmount = isClientPayment ? (computedAmount || '') : form.amount

  function update(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const grossAmount = parseFloat(String(effectiveAmount))
    if (!grossAmount || grossAmount <= 0) return

    const enabledDeductions = isIncome ? deductions.filter((d) => d.enabled) : []
    const totalDeducted     = enabledDeductions.reduce((s, d) => s + (grossAmount * d.rate) / 100, 0)
    const netAmount         = grossAmount - totalDeducted

    const deductionBreakdown = enabledDeductions.map((d) => ({
      label:    d.label,
      rate:     d.rate,
      amount:   parseFloat(((grossAmount * d.rate) / 100).toFixed(2)),
      category: d.category,
    }))

    const txs = [
      {
        project_id:          form.projectId || null,
        type:                form.type,
        category:            form.category,
        description:         form.description,
        amount:              grossAmount,
        gross_amount:        grossAmount,
        net_amount:          enabledDeductions.length > 0 ? netAmount : null,
        deduction_breakdown: deductionBreakdown,
        hours:               isClientPayment ? parseFloat(form.hours) || null : null,
        hourly_rate:         isClientPayment ? parseFloat(form.hourlyRate) || null : null,
        period_from:         form.periodFrom || null,
        period_to:           form.periodTo   || null,
        note:                form.note       || null,
        date:                form.date,
      },
      ...enabledDeductions.map((d) => ({
        project_id:   form.projectId || null,
        type:         'expense',
        category:     d.category,
        description:  `${d.label} — ${form.description}`,
        amount:       parseFloat(((grossAmount * d.rate) / 100).toFixed(2)),
        note:         `${d.rate}% of ${formatCurrency(grossAmount)}`,
        date:         form.date,
      })),
    ]

    onAddMany(txs)
  }

  const inputCls  = 'w-full h-9 px-3 rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors'
  const selectCls = 'w-full h-9 pl-3 pr-8 appearance-none rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/75 focus:outline-none focus:border-white/25 transition-colors'
  const labelCls  = 'block text-[11px] font-medium text-white/35 uppercase tracking-wider mb-1.5'
  const Sel = ({ value, onChange, children }) => (
    <div className="relative">
      <select value={value} onChange={onChange} className={selectCls}>{children}</select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-xl border border-white/[0.09] bg-[#141414] shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <h2 className="text-[14px] font-semibold text-white">{t('transactions.modalTitle')}</h2>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex gap-2">
            {['income', 'expense'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => update('type', type)}
                className={cn(
                  'flex-1 h-8 rounded-md text-[13px] font-medium transition-colors',
                  form.type === type
                    ? type === 'income'
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-white/[0.04] text-white/35 border border-white/[0.07] hover:text-white/60'
                )}
              >
                {type === 'income' ? t('transactions.income') : t('transactions.expenses')}
              </button>
            ))}
          </div>

          {isIncome && (
            <div className="flex gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/[0.07]">
              {INCOME_SUBTYPES.map(({ id, labelKey }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update('incomeSubtype', id)}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                    form.incomeSubtype === id ? 'bg-white/[0.10] text-white/85' : 'text-white/35 hover:text-white/60'
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className={labelCls}>{t('transactions.description')}</label>
            <input
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder={isClientPayment ? t('transactions.descClientPaymentPlaceholder') : t('transactions.descriptionPlaceholder')}
              required
              className={inputCls}
            />
          </div>

          {isClientPayment ? (
            <>
              <HoursRateCalc
                hours={form.hours}
                rate={form.hourlyRate}
                onHoursChange={(v) => update('hours', v)}
                onRateChange={(v) => update('hourlyRate', v)}
              />
              {(!form.hours || !form.hourlyRate) && (
                <p className="text-[11px] text-yellow-400/60 -mt-1">{t('transactions.fillHoursRate')}</p>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t('transactions.amountUsd')}</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.amount}
                  onChange={(e) => update('amount', e.target.value)}
                  placeholder="0.00"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('transactions.date')}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {isClientPayment && (
            <div>
              <label className={labelCls}>{t('transactions.date')}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
                className={inputCls}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('transactions.category')}</label>
              <Sel value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Sel>
            </div>
            <div>
              <label className={labelCls}>{t('transactions.project')}</label>
              <Sel value={form.projectId} onChange={(e) => update('projectId', e.target.value)}>
                <option value="">—</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Sel>
            </div>
          </div>

          {isClientPayment && (
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} />
                  {t('transactions.invoicePeriod')}
                  <span className="text-white/20 normal-case font-normal tracking-normal ml-1">
                    ({t('transactions.optional')})
                  </span>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-white/25 mb-1">{t('transactions.periodFrom')}</p>
                  <input type="date" value={form.periodFrom} onChange={(e) => update('periodFrom', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <p className="text-[10px] text-white/25 mb-1">{t('transactions.periodTo')}</p>
                  <input type="date" value={form.periodTo} onChange={(e) => update('periodTo', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {isIncome && deductions.length > 0 && (
            <DeductionsSection
              grossAmount={isClientPayment ? String(computedAmount || '') : form.amount}
              deductions={deductions}
              onChange={setDeductions}
            />
          )}

          <div>
            <label className={labelCls}>{t('transactions.note')}</label>
            <textarea
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder={t('transactions.notePlaceholder')}
              rows={2}
              className="w-full px-3 py-2 rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-md text-[13px] font-medium text-white/45 bg-white/[0.04] border border-white/[0.09] hover:text-white/65 hover:bg-white/[0.07] transition-colors"
            >
              {t('transactions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isClientPayment && (!form.hours || !form.hourlyRate)}
              className="flex-1 h-9 rounded-md text-[13px] font-semibold text-black bg-white hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('transactions.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TxRow({ tx, onDelete }) {
  const { t } = useTranslation()
  const [expanded, setExpanded]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const menuTriggerRef            = useRef(null)

  const hasDeductions = tx.deductionBreakdown?.length > 0
  const hasPeriod     = tx.periodFrom || tx.periodTo
  const hasHours      = tx.hours != null && tx.hourlyRate != null
  const hasDetails    = hasDeductions || hasPeriod || hasHours || tx.note

  const menuItems = [
    {
      label:   t('common.delete'),
      icon:    Trash2,
      variant: 'danger',
      onClick: () => { setMenuOpen(false); onDelete(tx.id) },
    },
  ]

  return (
    <tbody className={cn('border-b border-white/[0.05]', expanded && 'bg-white/[0.02]')}>
      <tr
        className={cn('group transition-colors', !expanded && 'hover:bg-white/[0.015]')}
        onClick={() => hasDetails && setExpanded((v) => !v)}
        style={{ cursor: hasDetails ? 'pointer' : 'default' }}
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              'w-5 h-5 flex items-center justify-center shrink-0 transition-transform duration-150',
              hasDetails ? 'text-white/30' : 'text-white/10',
              expanded && 'rotate-90'
            )}>
              <ChevronRight size={12} />
            </span>
            <div>
              <p className="text-[13px] text-white/75">{tx.description}</p>
              {tx.netAmount != null && !expanded && (
                <p className="text-[11px] text-white/30 mt-0.5 tabular-nums">
                  Net {formatCurrency(tx.netAmount)}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={CATEGORY_VARIANT[tx.category] ?? 'default'}>{tx.category}</Badge>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-[12px] text-white/35">{tx.project}</span>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="text-[12px] text-white/35">{formatDate(tx.date)}</span>
        </td>
        <td className="px-5 py-3 text-right">
          <span className={cn('text-[13px] font-medium tabular-nums', tx.type === 'income' ? 'text-green-400' : 'text-white/55')}>
            {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
          </span>
        </td>
        <td className="pr-3 py-3 w-8 text-right" onClick={(e) => e.stopPropagation()}>
          <button
            ref={menuTriggerRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md text-white/35 hover:text-white/75 hover:bg-white/[0.07] transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <DropdownMenu
              triggerRef={menuTriggerRef}
              items={menuItems}
              onClose={() => setMenuOpen(false)}
              align="right"
            />
          )}
        </td>
      </tr>

      {expanded && hasDetails && (
        <tr>
          <td colSpan={6} className="px-5 pb-4">
            <div className="ml-6 pl-4 border-l border-white/[0.08] space-y-3">
              {hasPeriod && (
                <div className="flex items-center gap-2">
                  <Calendar size={11} className="text-white/25 shrink-0" />
                  <span className="text-[11px] text-white/30 uppercase tracking-wider">{t('transactions.invoicePeriod')}</span>
                  <span className="text-[12px] text-white/55">
                    {tx.periodFrom ? formatDate(tx.periodFrom) : '—'}
                    <span className="mx-2 text-white/20">→</span>
                    {tx.periodTo ? formatDate(tx.periodTo) : '—'}
                  </span>
                </div>
              )}

              {hasDeductions && (
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/40">{t('deductions.gross')}</span>
                      {tx.hours != null && tx.hourlyRate != null && (
                        <span className="text-[11px] text-white/25 tabular-nums">
                          {tx.hours}h × {formatCurrency(tx.hourlyRate)}/hr
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-green-400 tabular-nums">
                      +{formatCurrency(tx.grossAmount)}
                    </span>
                  </div>

                  {tx.deductionBreakdown.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-white/15 text-[10px]">
                          {i === tx.deductionBreakdown.length - 1 ? '└' : '├'}
                        </span>
                        <span className="text-[12px] text-white/45">{d.label}</span>
                        <span className="text-[10px] text-white/20 tabular-nums bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {d.rate}%
                        </span>
                      </div>
                      <span className="text-[12px] text-red-400/65 tabular-nums">
                        −{formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.07]">
                    <span className="text-[12px] font-medium text-white/50">{t('deductions.net')}</span>
                    <span className="text-[14px] font-semibold text-white/85 tabular-nums">
                      {formatCurrency(tx.netAmount)}
                    </span>
                  </div>
                </div>
              )}

              {!hasDeductions && hasHours && (
                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white/40">{t('deductions.gross')}</span>
                    <span className="text-[11px] text-white/25 tabular-nums">
                      {tx.hours}h × {formatCurrency(tx.hourlyRate)}/hr
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-green-400 tabular-nums">
                    +{formatCurrency(tx.hours * tx.hourlyRate)}
                  </span>
                </div>
              )}

              {tx.note && (
                <p className="text-[12px] text-white/35">{tx.note}</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  )
}

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { selectedProject } = useAppStore()
  const queryClient = useQueryClient()

  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter, setCatFilter]   = useState('all')
  const [showModal, setShowModal]   = useState(false)

  const { data: rawTransactions = [], isLoading } = useQuery({
    queryKey: ['transactions', selectedProject?.id],
    queryFn: () =>
      api.get('/transactions', {
        params: selectedProject?.id ? { projectId: selectedProject.id } : {},
      }).then((r) => r.data),
  })

  const transactions = rawTransactions.map(normalizeTx)

  const addMutation = useMutation({
    mutationFn: (txs) => Promise.all(txs.map((tx) => api.post('/transactions', tx))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setShowModal(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })

  const filtered = transactions.filter((tx) => {
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    if (catFilter !== 'all' && tx.category !== catFilter) return false
    return true
  })

  const totalIncome   = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net           = totalIncome - totalExpenses

  const TYPE_TABS = [
    { key: 'all',     label: t('transactions.typeAll') },
    { key: 'income',  label: t('transactions.typeIncome') },
    { key: 'expense', label: t('transactions.typeExpense') },
  ]

  return (
    <div className="p-6 max-w-[1200px] space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-white">{t('transactions.title')}</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{selectedProject?.name}</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={13} />
          {t('transactions.addTransaction')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {[
          { label: t('transactions.income'),   value: totalIncome,   color: 'text-green-400' },
          { label: t('transactions.expenses'), value: totalExpenses, color: 'text-red-400' },
          { label: t('transactions.net'),      value: net,           color: net >= 0 ? 'text-white/80' : 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-[#111]">
            <span className="text-[11px] text-white/30 uppercase tracking-wider">{label}</span>
            <span className={cn('text-[13px] font-semibold tabular-nums', color)}>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 h-[30px] px-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] min-w-[220px]">
          <Search size={12} className="text-white/25 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('transactions.searchPlaceholder')}
            className="flex-1 bg-transparent text-[13px] text-white/75 placeholder:text-white/25 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/25 hover:text-white/55 transition-colors">
              <X size={11} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-px p-0.5 rounded-md bg-white/[0.04] border border-white/[0.07]">
          {TYPE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn(
                'px-2.5 py-1 rounded text-[12px] font-medium transition-colors',
                typeFilter === key ? 'bg-white/10 text-white/85' : 'text-white/35 hover:text-white/60'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-[30px] pl-3 pr-7 appearance-none rounded-md text-[12px] bg-white/[0.04] border border-white/[0.07] text-white/55 focus:outline-none focus:border-white/20 transition-colors"
          >
            <option value="all">{t('transactions.allCategories')}</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        <span className="text-[12px] text-white/25 ml-auto">
          {t(filtered.length === 1 ? 'transactions.countOne' : 'transactions.countOther', { count: filtered.length })}
        </span>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-[#111] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.description')}</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.category')}</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider hidden lg:table-cell">{t('table.project')}</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider hidden md:table-cell">{t('table.date')}</th>
              <th className="text-right px-5 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.amount')}</th>
              <th className="w-8 pr-3" />
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td className="px-5 py-3"><div className="h-4 w-48 rounded bg-white/[0.05] animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 rounded-full bg-white/[0.05] animate-pulse" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-24 rounded bg-white/[0.05] animate-pulse" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded bg-white/[0.05] animate-pulse" /></td>
                  <td className="px-5 py-3 text-right"><div className="h-4 w-16 rounded bg-white/[0.05] animate-pulse ml-auto" /></td>
                  <td className="pr-3 w-8" />
                </tr>
              ))}
            </tbody>
          ) : filtered.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-[13px] text-white/25">
                  {t('transactions.noResults')}
                </td>
              </tr>
            </tbody>
          ) : (
            filtered.map((tx) => (
              <TxRow
                key={tx.id}
                tx={tx}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))
          )}
        </table>
      </div>

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAddMany={(txs) => addMutation.mutate(txs)}
        />
      )}
    </div>
  )
}
