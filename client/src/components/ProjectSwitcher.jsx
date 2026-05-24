import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Check, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import api from '../lib/api'

export default function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const { selectedProject, setSelectedProject } = useAppStore()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject, setSelectedProject])

  useEffect(() => {
    function onOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-2.5 h-[30px] rounded-md text-[13px]',
          'border border-white/[0.09] bg-white/[0.04]',
          'hover:bg-white/[0.07] hover:border-white/[0.15] transition-colors duration-150',
          open && 'bg-white/[0.07] border-white/[0.15]'
        )}
      >
        <div
          className="w-3 h-3 rounded-sm shrink-0"
          style={{ backgroundColor: selectedProject?.color ?? '#3b82f6' }}
        />
        <span className="text-white/75 font-medium max-w-[180px] truncate">
          {selectedProject?.name ?? 'Select Project'}
        </span>
        <ChevronDown size={12} className="text-white/30 ml-0.5 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[268px] z-50 rounded-lg border border-white/[0.09] bg-[#141414] shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 px-2.5 h-[30px] rounded-md bg-white/[0.04] border border-white/[0.07]">
              <Search size={11} className="text-white/25 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="flex-1 bg-transparent text-[13px] text-white/70 placeholder:text-white/25 outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="py-1 max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-5 text-center text-xs text-white/25">No projects found</p>
            ) : (
              filtered.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px]',
                    'hover:bg-white/[0.04] transition-colors duration-100 text-left'
                  )}
                >
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 text-white/70 truncate">{project.name}</span>
                  {project.status === 'archived' && (
                    <span className="text-[10px] text-white/25 mr-1">archived</span>
                  )}
                  {project.id === selectedProject?.id && (
                    <Check size={11} className="text-white/50 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
