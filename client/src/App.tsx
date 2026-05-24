import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import ProjectsPage from './pages/ProjectsPage'
import TransactionsPage from './pages/TransactionsPage'
import SettingsPage from './pages/SettingsPage'
import api from './lib/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 5 * 60_000 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth/me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
