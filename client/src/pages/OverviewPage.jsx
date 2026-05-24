import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'
import Badge from '../components/ui/Badge'
import api from '../lib/api'

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

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#111] p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider">{label}</p>
        <div className="w-[30px] h-[30px] rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <Icon size={13} className="text-white/30" />
        </div>
      </div>
      <p className="text-[22px] font-semibold text-white tracking-tight tabular-nums">
        {formatCurrency(value)}
      </p>
    </div>
  )
}

export default function OverviewPage() {
  const { t } = useTranslation()
  const { selectedProject } = useAppStore()

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', selectedProject?.id],
    queryFn: () =>
      api.get('/transactions', {
        params: selectedProject?.id ? { projectId: selectedProject.id } : {},
      }).then((r) => r.data),
  })

  const now        = new Date()
  const thisMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthly    = transactions.filter((tx) => tx.date?.slice(0, 7) === thisMonth)

  const income   = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance  = transactions.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
  const net      = income - expenses

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  const STATS = [
    { label: t('overview.currentBalance'),  value: balance,  icon: DollarSign },
    { label: t('overview.monthlyIncome'),   value: income,   icon: TrendingUp },
    { label: t('overview.monthlyExpenses'), value: expenses, icon: TrendingDown },
    { label: t('overview.netProfit'),       value: net,      icon: ArrowUpRight },
  ]

  return (
    <div className="p-6 max-w-[1200px] space-y-6">
      <div>
        <h1 className="text-[17px] font-semibold text-white">{t('overview.title')}</h1>
        <p className="text-[13px] text-white/35 mt-0.5">{selectedProject?.name}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <h2 className="text-[13px] font-semibold text-white">{t('overview.recentTxs')}</h2>
          <Link to="/transactions" className="text-[12px] text-white/35 hover:text-white/65 transition-colors">
            {t('overview.viewAll')}
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-5 py-2.5 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.description')}</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.category')}</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-white/25 uppercase tracking-wider hidden lg:table-cell">{t('table.project')}</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-white/25 uppercase tracking-wider hidden md:table-cell">{t('table.date')}</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('table.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-white/25">
                  {t('transactions.noResults')}
                </td>
              </tr>
            ) : (
              recent.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-white/75">{tx.description}</span>
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
                    <span className={`text-[13px] font-medium tabular-nums ${tx.type === 'income' ? 'text-green-400' : 'text-white/55'}`}>
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
