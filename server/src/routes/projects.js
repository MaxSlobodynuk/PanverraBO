const router = require('express').Router()
const supabase = require('../db')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { name, color } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: name.trim(), color: color || '#3b82f6', status: 'active' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.patch('/:id', async (req, res) => {
  const { name, color, status } = req.body
  const updates = { updated_at: new Date().toISOString() }
  if (name !== undefined) updates.name = name.trim()
  if (color !== undefined) updates.color = color
  if (status !== undefined) updates.status = status

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

module.exports = router
