import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js'
import scanRoutes from './routes/scan.routes.js'
import reportRoutes from './routes/report.routes.js'
import medicineRoutes from './routes/medicine.routes.js'
import chemistRoutes from './routes/chemist.routes.js'
import alertRoutes from './routes/alert.routes.js'
import batchRoutes from './routes/batch.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import agentRoutes from './routes/agent.routes.js'
import { startAllJobs } from './jobs/cdscoScraper.job.js'

dotenv.config()

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

// Logging
app.use(morgan('dev'))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/scan', scanRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/medicines', medicineRoutes)
app.use('/api/v1/chemists', chemistRoutes)
app.use('/api/v1/alerts', alertRoutes)
app.use('/api/v1/batch', batchRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/agent', agentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediGuard API is running', timestamp: new Date() })
})

// Error handlers
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

import { runSeed } from './utils/seedData.js'

connectDB().then(async () => {
  console.log('Running automatic seeding for initial data...')
  await runSeed()
  app.listen(PORT, () => {
    console.log(`MediGuard server running on port ${PORT}`)
    startAllJobs()
  })
}).catch(err => {
  console.error("Failed to connect to DB", err)
})
