import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import Button from '../components/ui/Button'
import api from '../lib/api'

function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.07]">
        <h2 className="text-[13px] font-semibold text-white">{title}</h2>
        {description && <p className="text-[12px] text-white/35 mt-0.5">{description}</p>}
      </div>
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </div>
  )
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-[13px] text-white/75">{label}</p>
        {description && <p className="text-[12px] text-white/30 mt-0.5">{description}</p>}
      </div>
      <div className="ml-6 shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const { data: user } = useQuery({ queryKey: ['auth/me'] })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  return (
    <div className="p-6 max-w-[680px] space-y-5">
      <div>
        <h1 className="text-[17px] font-semibold text-white">{t('settings.title')}</h1>
        <p className="text-[13px] text-white/35 mt-0.5">{t('settings.subtitle')}</p>
      </div>

      <Section title={t('settings.profile')} description={t('settings.profileDesc')}>
        <Row label={t('settings.fullName')} description={t('settings.fullNameDesc')}>
          <span className="text-[13px] text-white/40">{user?.name}</span>
        </Row>
        <Row label={t('settings.email')} description={t('settings.emailDesc')}>
          <span className="text-[13px] text-white/40">{user?.email}</span>
        </Row>
        <Row label={t('settings.role')} description={t('settings.roleDesc')}>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {user?.role}
          </span>
        </Row>
      </Section>

      <Section title={t('settings.system')} description={t('settings.systemDesc')}>
        <Row label={t('settings.version')} description={t('settings.versionDesc')}>
          <span className="text-[13px] text-white/35">v1.0.0</span>
        </Row>
        <Row label={t('settings.environment')} description={t('settings.envDesc')}>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            production
          </span>
        </Row>
        <Row label={t('settings.database')} description={t('settings.dbDesc')}>
          <span className="text-[13px] text-white/35">Supabase / PostgreSQL</span>
        </Row>
      </Section>

      <Section title={t('settings.dangerZone')}>
        <Row label={t('settings.signOut')} description={t('settings.signOutDesc')}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={12} />
            {t('settings.signOut')}
          </Button>
        </Row>
      </Section>
    </div>
  )
}
