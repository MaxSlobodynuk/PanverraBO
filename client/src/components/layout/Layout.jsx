import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ProjectSwitcher from '../ProjectSwitcher'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-[54px] border-b border-white/[0.07] flex items-center px-5 gap-4 shrink-0">
          <ProjectSwitcher />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
