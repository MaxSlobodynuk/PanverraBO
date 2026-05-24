const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/settings', require('./routes/settings'))

app.get('/health', (req, res) => res.json({ ok: true }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server on port ${PORT}`))
