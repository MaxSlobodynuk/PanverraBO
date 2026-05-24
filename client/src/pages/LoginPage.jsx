import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { LogoIcon } from '../components/Logo'
import LangSwitcher from '../components/LangSwitcher'
import api from '../lib/api'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()
  const queryClient             = useQueryClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: user } = await api.post('/auth/login', { email, password })
      queryClient.setQueryData(['auth/me'], user)
      navigate('/overview')
    } catch (err) {
      setError(err.response?.data?.error ?? t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <LangSwitcher />
      </div>

      <div className="w-full max-w-[380px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <LogoIcon size={32} />
          <span className="text-[16px] font-semibold text-white tracking-tight">PANVERRA BO</span>
        </div>

        <div className="rounded-xl border border-white/[0.09] bg-[#111] p-7">
          <div className="mb-6">
            <h1 className="text-[17px] font-semibold text-white mb-1">{t('login.title')}</h1>
            <p className="text-[13px] text-white/35">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@panverra.com"
                required
                autoComplete="email"
                className="w-full h-9 px-3 rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-9 px-3 pr-9 rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-5">
          {t('login.footer')}
        </p>
      </div>
    </div>
  )
}
