import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  FolderOpen,
  ArrowLeftRight,
  Receipt,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LogoIcon } from '../Logo'
import LangSwitcher from '../LangSwitcher'
import { cn } from '../../lib/utils'
import api from '../../lib/api'

function useNavItems() {
  const { t } = useTranslation()
  return [
    { label: t('nav.overview'),     icon: LayoutDashboard, path: '/overview' },
    { label: t('nav.projects'),     icon: FolderOpen,      path: '/projects' },
    { label: t('nav.transactions'), icon: ArrowLeftRight,  path: '/transactions' },
    { label: t('nav.expenses'),     icon: Receipt,         path: '/expenses' },
    { label: t('nav.payroll'),      icon: Users,           path: '/payroll' },
    { label: t('nav.sales'),        icon: TrendingUp,      path: '/sales' },
    { label: t('nav.reports'),      icon: BarChart3,       path: '/reports' },
  ]
}

function NavItem({ icon: Icon, label, path, active }) {
  return (
    <Link
      to={path}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors duration-100',
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
      )}
    >
      <Icon
        size={14}
        className={cn('shrink-0', active ? 'text-white' : 'text-white/30')}
      />
      {label}
    </Link>
  )
}

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { data: user } = useQuery({ queryKey: ['auth/me'] })
  const navItems = useNavItems()

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className="w-[220px] h-screen flex flex-col border-r border-white/[0.07] bg-[#0a0a0a] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[54px] border-b border-white/[0.07] shrink-0">
        <LogoIcon size={22} />
        <span className="text-[13px] font-semibold text-white tracking-tight">PANVERRA BO</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-2.5 space-y-px overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} active={isActive(item.path)} />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 py-2 border-t border-white/[0.07]">
        <NavItem
          icon={Settings}
          label={t('nav.settings')}
          path="/settings"
          active={isActive('/settings')}
        />
      </div>

      {/* Lang switcher + user */}
      <div className="px-3 py-3 border-t border-white/[0.07] space-y-2.5">
        <LangSwitcher />
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-white/70">
              {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/70 truncate leading-tight">
              {user?.name ?? 'User'}
            </p>
            <p className="text-[11px] text-white/30 truncate leading-tight mt-0.5">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
