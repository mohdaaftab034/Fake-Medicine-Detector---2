import express from 'express'
import { analyzeMedicine, getScanHistory, getScanById, deleteScan, getPublicStats, chatWithGroq } from '../controllers/scan.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { medicineImageUpload } from '../middleware/upload.middleware.js'
import { scanLimiter } from '../middleware/rateLimit.middleware.js'

const router = express.Router()

router.get('/stats/public', getPublicStats)

router.use(verifyToken)

router.post('/analyze', scanLimiter, medicineImageUpload.single('medicineImage'), analyzeMedicine)
router.post('/chat', chatWithGroq)
router.get('/history', getScanHistory)
router.get('/:id', getScanById)
router.delete('/:id', deleteScan)

export default router
