import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.model.js'
import Chemist from '../models/Chemist.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendWelcomeEmail } from '../services/email.service.js'

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  })
  return { accessToken, refreshToken }
}

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role, city, state } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new ApiError(400, 'Email already in use'))
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const user = await User.create({
    name, email, password: hashedPassword, phone, role, city, state
  })

  if (role === 'chemist') {
    const { shopName, licenseNumber, address, pincode } = req.body
    await Chemist.create({
      user: user._id, shopName, licenseNumber, address, city, state, pincode, phone
    })
  }

  const { accessToken, refreshToken } = generateTokens(user._id)
  
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  sendWelcomeEmail(user)

  const userObj = user.toObject()
  delete userObj.password

  res.status(201).json(new ApiResponse(201, { user: userObj, accessToken, refreshToken }, 'User registered successfully'))
})

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError(401, 'Invalid email or password'))
  }

  if (!user.isActive) {
    return next(new ApiError(401, 'Your account has been deactivated'))
  }

  const { accessToken, refreshToken } = generateTokens(user._id)

  user.refreshToken = refreshToken
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const userObj = user.toObject()
  delete userObj.password

  res.status(200).json(new ApiResponse(200, { user: userObj, accessToken, refreshToken }, 'Login successful'))
})

export const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (user) {
    user.refreshToken = null
    await user.save({ validateBeforeSave: false })
  }
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
})

export const refreshToken = asyncHandler(async (req, res, next) => {
  // refresh token validation handled in middleware, which sets req.user
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(req.user._id)
  
  req.user.refreshToken = newRefreshToken
  await req.user.save({ validateBeforeSave: false })
  
  res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully'))
})

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken')
  let data = { user }

  if (user.role === 'chemist') {
    const chemist = await Chemist.findOne({ user: user._id })
    data.chemist = chemist
  }

  res.status(200).json(new ApiResponse(200, data, 'Profile fetched successfully'))
})

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, city, state, notificationPreferences } = req.body

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, city, state, notificationPreferences },
    { new: true, runValidators: true }
  ).select('-password -refreshToken')

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'))
})

export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body
  
  const user = await User.findById(req.user._id)
  
  if (!(await bcrypt.compare(oldPassword, user.password))) {
    return next(new ApiError(400, 'Incorrect old password'))
  }
  
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(newPassword, salt)
  await user.save()
  
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'))
})

export const forgotPassword = asyncHandler(async (req, res, next) => {
  // To be implemented: generate reset token, store hash, send email
  res.status(200).json(new ApiResponse(200, null, 'Reset token generated (mock)'))
})

export const resetPassword = asyncHandler(async (req, res, next) => {
  // To be implemented: verify token, update password
  res.status(200).json(new ApiResponse(200, null, 'Password reset successful (mock)'))
})
