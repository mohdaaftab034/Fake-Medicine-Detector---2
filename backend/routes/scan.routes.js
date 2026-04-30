import express from 'express'
import { analyzeMedicine, getScanHistory, getScanById, deleteScan, getPublicStats, chatWithGroq } from '../controllers/scan.controller.js'
import { verifyToken, optionalVerifyToken } from '../middleware/auth.middleware.js'
import { medicineImageUpload } from '../middleware/upload.middleware.js'
import { scanLimiter } from '../middleware/rateLimit.middleware.js'

const router = express.Router()

router.get('/stats/public', getPublicStats)

router.post('/analyze', optionalVerifyToken, scanLimiter, medicineImageUpload.single('medicineImage'), analyzeMedicine)
router.post('/chat', optionalVerifyToken, chatWithGroq)

router.use(verifyToken)

router.get('/history', getScanHistory)
router.get('/:id', getScanById)
router.delete('/:id', deleteScan)

export default router
