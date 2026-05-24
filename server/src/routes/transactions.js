const router = require('express').Router()
const supabase = require('../db')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  const { projectId, type, category } = req.query

  let query = supabase
    .from('transactions')
    .select('*, projects(name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (projectId && projectId !== 'all') query = query.eq('project_id', projectId)
  if (type && type !== 'all') query = query.eq('type', type)
  if (category && category !== 'all') query = query.eq('category', category)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const result = data.map(({ projects, ...tx }) => ({
    ...tx,
    project: projects?.name ?? null,
  }))

  res.json(result)
})

router.post('/', async (req, res) => {
  const {
    project_id, type, category, description, amount,
    gross_amount, net_amount, hours, hourly_rate,
    period_from, period_to, note, deduction_breakdown, date,
  } = req.body

  if (!type || !category || !description || amount == null) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      project_id: project_id || null,
      type,
      category,
      description,
      amount: Number(amount),
      gross_amount: gross_amount != null ? Number(gross_amount) : null,
      net_amount: net_amount != null ? Number(net_amount) : null,
      hours: hours != null ? Number(hours) : null,
      hourly_rate: hourly_rate != null ? Number(hourly_rate) : null,
      period_from: period_from || null,
      period_to: period_to || null,
      note: note || null,
      deduction_breakdown: deduction_breakdown || [],
      date: date || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

module.exports = router
