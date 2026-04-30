import { ApiError } from '../utils/apiResponse.js'

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User not authenticated'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access Denied: Insufficient permissions'))
    }
    next()
  }
}

export const isAdmin = requireRole('admin')
export const isChemist = requireRole('chemist')
export const isPublicUser = requireRole('public')
