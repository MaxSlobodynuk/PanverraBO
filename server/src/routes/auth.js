const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supabase = require('../db')

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .limit(1)

  if (error || !users?.length) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const user = users[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('token', token, COOKIE_OPTS)
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

router.get('/me', async (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', payload.id)
      .limit(1)

    if (!users?.length) return res.status(401).json({ error: 'Unauthorized' })
    res.json(users[0])
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ ok: true })
})

module.exports = router
