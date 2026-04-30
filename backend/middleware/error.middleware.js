import { ApiError } from '../utils/apiResponse.js'

export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`)
  next(error)
}

export const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR START ---')
  console.error('Status Code:', err.statusCode || 500)
  console.error('Message:', err.message)
  console.error('Stack:', err.stack)
  if (err.errors) console.error('Errors:', err.errors)
  console.error('--- ERROR END ---')

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errors = err.errors || []

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found'
    statusCode = 404
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered'
    statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ')
    statusCode = 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.'
    statusCode = 401
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.'
    statusCode = 401
  }
  
  // Multer errors
  if (err.name === 'MulterError') {
    message = err.message
    statusCode = 400
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === 'development' ? err.stack : errors
  })
}
