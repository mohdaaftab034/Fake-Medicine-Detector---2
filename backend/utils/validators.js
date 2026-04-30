import { body, validationResult } from 'express-validator'
import { ApiError } from './apiResponse.js'

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation Error', errors.array()))
  }
  next() 
}

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').optional().isIn(['public', 'chemist', 'admin']).withMessage('Invalid role')
]

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]
