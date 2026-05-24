const router = require('express').Router()
const supabase = require('../db')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

router.get('/deductions', async (req, res) => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'deduction_presets')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data.value)
})

router.put('/deductions', async (req, res) => {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'deduction_presets',
      value: req.body,
      updated_at: new Date().toISOString(),
    })
    .select('value')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data.value)
})

module.exports = router
