import express from 'express'
import { getAllAlerts, getAlertById, createAlert, updateAlert, deactivateAlert, markAsRead, getUnreadCount } from '../controllers/alert.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

// Check if user is logged in for optional auth in getAllAlerts
router.get('/', (req, res, next) => {
  // Mock optional auth middleware behaviour
  verifyToken(req, res, (err) => {
    if (err) req.user = null
    next()
  })
}, getAllAlerts)

router.get('/:id', getAlertById)

router.use(verifyToken)
router.get('/unread/count', getUnreadCount)
router.post('/:id/read', markAsRead)

// Admin
router.post('/', isAdmin, createAlert)
router.put('/:id', isAdmin, updateAlert)
router.put('/:id/deactivate', isAdmin, deactivateAlert)

export default router
