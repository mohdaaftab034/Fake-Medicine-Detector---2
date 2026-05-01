import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, ApiError } from '../utils/apiResponse.js'
import { runMediGuardAgent } from '../services/agent.service.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/chat', verifyToken, asyncHandler(async (req, res) => {
  const { message, context } = req.body

  if (!message) throw new ApiError(400, 'Message is required')

  console.log('[AGENT ROUTE] User message:', message)

  const result = await runMediGuardAgent(message, {
    ...context,
    userId: req.user._id,
    state: req.user.state
  })

  return res.json(new ApiResponse(200, {
    reply: result.response,
    toolsUsed: result.toolsUsed,
    iterations: result.iterations
  }))
}))

export default router
