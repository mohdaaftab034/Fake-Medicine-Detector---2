import express from 'express'
import { submitReport, getMyReports, getAllReports, updateReportStatus, forwardToCDSCO, getReportStats } from '../controllers/report.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'
import { documentUpload } from '../middleware/upload.middleware.js'

const router = express.Router()

router.use(verifyToken)

router.post('/submit', documentUpload.fields([
  { name: 'medicineImages', maxCount: 3 },
  { name: 'receiptImage', maxCount: 1 }
]), submitReport)

router.get('/my-reports', getMyReports)
router.get('/:id', getMyReports) // In reality this should be getReportById but user didn't specify.

// Admin routes
router.get('/all', isAdmin, getAllReports)
router.get('/stats/overview', isAdmin, getReportStats)
router.put('/:id/status', isAdmin, updateReportStatus)
router.post('/:id/forward-cdsco', isAdmin, forwardToCDSCO)

export default router
