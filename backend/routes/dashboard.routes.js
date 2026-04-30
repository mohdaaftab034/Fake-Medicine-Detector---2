import express from 'express'
import { getPublicDashboard, getUserDashboard, getChemistDashboard, getAdminDashboard } from '../controllers/dashboard.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isChemist, isAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

router.get('/public', getPublicDashboard)

router.use(verifyToken)

router.get('/user', getUserDashboard)
router.get('/chemist', isChemist, getChemistDashboard)
router.get('/admin', isAdmin, getAdminDashboard)

export default router
