import express from 'express'
import { register, login, logout, refreshToken, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { verifyToken, verifyRefreshToken } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimit.middleware.js'

const router = express.Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', verifyToken, logout)
router.post('/refresh-token', verifyRefreshToken, refreshToken)

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.put('/change-password', verifyToken, changePassword)

router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)

export default router
