import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MoreHorizontal, FolderOpen, Pencil, Archive, ArchiveRestore, Trash2, X, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DropdownMenu from '../components/ui/DropdownMenu'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import api from '../lib/api'

const PRESET_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#ef4444', '#06b6d4', '#f97316',
  '#10b981', '#6366f1', '#84cc16', '#a855f7',
]

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-6 h-6 rounded-md transition-transform hover:scale-110 relative"
          style={{ backgroundColor: color }}
        >
          {value === color && (
            <Check size={11} className="absolute inset-0 m-auto text-white drop-shadow" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  )
}

function ProjectModal({ project, onClose, onSubmit, isPending }) {
  const { t } = useTranslation()
  const isEdit = Boolean(project)
  const [name, setName]   = useState(project?.name  ?? '')
  const [color, setColor] = useState(project?.color ?? PRESET_COLORS[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-xl border border-white/[0.09] bg-[#141414] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-[14px] font-semibold text-white">
            {isEdit ? t('projects.editProject') : t('projects.newProject')}
          </h2>
          <button onClick={onClose} className="text-white/25 hover:text-white/65 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
              {t('projects.projectName')}
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('projects.projectNamePlaceholder')}
              required
              className="w-full h-9 px-3 rounded-md text-[13px] bg-white/[0.04] border border-white/[0.09] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2.5">
              {t('projects.color')}
            </label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + '22' }}
            >
              <FolderOpen size={14} style={{ color }} />
            </div>
            <span className="text-[13px] font-medium text-white/70">
              {name || t('projects.projectNamePlaceholder')}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-md text-[13px] font-medium text-white/45 bg-white/[0.04] border border-white/[0.09] hover:text-white/65 hover:bg-white/[0.07] transition-colors"
            >
              {t('projects.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-9 rounded-md text-[13px] font-semibold text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {isEdit ? t('projects.saveChanges') : t('projects.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ project, onClose, onConfirm, isPending }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[380px] rounded-xl border border-white/[0.09] bg-[#141414] shadow-2xl p-6">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 size={16} className="text-red-400" />
        </div>
        <h2 className="text-[14px] font-semibold text-white mb-1">{t('projects.deleteTitle')}</h2>
        <p className="text-[13px] text-white/40 mb-5">
          {t('projects.deleteDesc', { name: project.name })}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md text-[13px] font-medium text-white/45 bg-white/[0.04] border border-white/[0.09] hover:text-white/65 hover:bg-white/[0.07] transition-colors"
          >
            {t('projects.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-9 rounded-md text-[13px] font-semibold text-white bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {t('projects.confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectRowMenu({ project, onEdit, onToggleStatus, onDelete }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const items = [
    { label: t('projects.edit'),        icon: Pencil,           onClick: onEdit },
    {
      label: project.status === 'active' ? t('projects.archive') : t('projects.unarchive'),
      icon:  project.status === 'active' ? Archive : ArchiveRestore,
      onClick: onToggleStatus,
    },
    { separator: true },
    { label: t('projects.delete'), icon: Trash2, variant: 'danger', onClick: onDelete },
  ]

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded transition-colors duration-100',
          'text-white/25 hover:text-white/70 hover:bg-white/[0.06]',
          open && 'text-white/70 bg-white/[0.06]'
        )}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <DropdownMenu
          triggerRef={triggerRef}
          items={items}
          onClose={() => setOpen(false)}
          align="right"
        />
      )}
    </>
  )
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  const queryClient         = useQueryClient()
  const { setSelectedProject, selectedProject } = useAppStore()

  const [showCreate, setShowCreate]    = useState(false)
  const [editingProject, setEditing]   = useState(null)
  const [deletingProject, setDeleting] = useState(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/projects', body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowCreate(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/projects/${id}`, body).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (selectedProject?.id === updated.id) setSelectedProject(updated)
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (selectedProject?.id === deletedId) {
        const remaining = projects.filter((p) => p.id !== deletedId)
        setSelectedProject(remaining[0] ?? null)
      }
      setDeleting(null)
    },
  })

  const activeCount = projects.filter((p) => p.status === 'active').length

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px]">
        <div className="h-8 w-48 rounded bg-white/[0.05] animate-pulse mb-5" />
        <div className="rounded-lg border border-white/[0.08] bg-[#111] h-64 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1200px] space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-white">{t('projects.title')}</h1>
          <p className="text-[13px] text-white/35 mt-0.5">
            {t('projects.activeCount', { count: activeCount })}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={13} />
          {t('projects.newProject')}
        </Button>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-[#111] overflow-hidden">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
              <FolderOpen size={16} className="text-white/25" />
            </div>
            <p className="text-[13px] text-white/30">{t('projects.empty')}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-[12px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              {t('projects.newProject')}
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('projects.projectCol')}</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider">{t('projects.status')}</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-white/25 uppercase tracking-wider hidden md:table-cell">{t('projects.createdAt')}</th>
                <th className="w-12 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: project.color + '22' }}
                      >
                        <FolderOpen size={14} style={{ color: project.color }} />
                      </div>
                      <span className="text-[13px] font-medium text-white/80">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                      {project.status === 'active' ? t('projects.active') : t('projects.archived')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-[12px] text-white/35">{formatDate(project.created_at)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ProjectRowMenu
                        project={project}
                        onEdit={() => setEditing(project)}
                        onToggleStatus={() =>
                          updateMutation.mutate({
                            id: project.id,
                            status: project.status === 'active' ? 'archived' : 'active',
                          })
                        }
                        onDelete={() => setDeleting(project)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <ProjectModal
          onClose={() => setShowCreate(false)}
          onSubmit={(body) => createMutation.mutate(body)}
          isPending={createMutation.isPending}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditing(null)}
          onSubmit={(body) => updateMutation.mutate({ id: editingProject.id, ...body })}
          isPending={updateMutation.isPending}
        />
      )}

      {deletingProject && (
        <DeleteConfirmModal
          project={deletingProject}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteMutation.mutate(deletingProject.id)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
