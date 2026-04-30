import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/apiResponse.js'
import User from '../models/User.model.js'

export const verifyToken = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized, no token provided'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = await User.findById(decoded.id).select('-password')
    
    if (!req.user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists'))
    }
    
    if (!req.user.isActive) {
      return next(new ApiError(401, 'User account is deactivated'))
    }

    next()
  } catch (error) {
    next(new ApiError(401, 'Not authorized, token failed'))
  }
}

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return next(new ApiError(401, 'Refresh token not provided'))
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    const user = await User.findById(decoded.id)
    
    if (!user || user.refreshToken !== refreshToken) {
      return next(new ApiError(401, 'Invalid refresh token'))
    }

    req.user = user
    next()
  } catch (error) {
    next(new ApiError(401, 'Refresh token expired or invalid'))
  }
}
