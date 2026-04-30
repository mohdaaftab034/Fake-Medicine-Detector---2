import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'
import { ApiError } from '../utils/apiResponse.js'
import path from 'path'
import fs from 'fs'

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'

let medicineStorage;
let documentStorage;

if (isCloudinaryConfigured) {
  console.log('--- Using Cloudinary Storage ---')
  medicineStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'mediguard/medicines',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic'],
      format: 'jpg',
      transformation: [{ quality: 90, width: 1600, crop: 'limit' }]
    }
  })

  documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'mediguard/documents'
    }
  })
} else {
  console.log('--- Using Local Disk Storage Fallback ---')
  // Ensure uploads directory exists
  const uploadDir = 'uploads'
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })

  medicineStorage = localStorage
  documentStorage = localStorage
}

const fileFilterImages = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Not an image! Please upload only images.'), false)
  }
}

const fileFilterDocs = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Not a supported format! Please upload images or PDFs.'), false)
  }
}

export const medicineImageUpload = multer({
  storage: medicineStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilterImages
})

export const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilterDocs
})
