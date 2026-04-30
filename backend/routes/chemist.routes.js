import express from 'express'
import { registerChemist, getMyChemistProfile, updateChemistProfile, getNearbyChemists, getVerificationQueue, approveChemist, rejectChemist, blacklistChemist, getChemistStats } from '../controllers/chemist.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isChemist, isAdmin } from '../middleware/role.middleware.js'
import { documentUpload } from '../middleware/upload.middleware.js'

const router = express.Router()

router.get('/nearby', getNearbyChemists)

router.use(verifyToken)

// Chemist specific
router.post('/register', isChemist, documentUpload.fields([
  { name: 'licenseImage', maxCount: 1 },
  { name: 'shopImage', maxCount: 1 }
]), registerChemist)
router.get('/my-profile', isChemist, getMyChemistProfile)
router.put('/my-profile', isChemist, updateChemistProfile)

// Admin specific
router.get('/verification-queue', isAdmin, getVerificationQueue)
router.get('/stats', isAdmin, getChemistStats)
router.put('/:id/approve', isAdmin, approveChemist)
router.put('/:id/reject', isAdmin, rejectChemist)
router.put('/:id/blacklist', isAdmin, blacklistChemist)

export default router
