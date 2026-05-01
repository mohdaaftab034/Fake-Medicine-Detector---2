import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  manufacturer: { type: String, required: true },
  category: {
    type: String,
    enum: ['tablet', 'syrup', 'injection', 'capsule', 'cream', 'drops', 'inhaler', 'other']
  },
  mrp: Number,
  description: String,
  genuinePackagingDescription: String,
  hologramLocation: String,
  barcodeFormat: String,
  commonFakeIndicators: [String],
  drugInteractions: [String],
  sideEffects: [String],
  dosage: String,
  storageInstructions: String,
  requiresPrescription: { type: Boolean, default: false },
  searchCount: { type: Number, default: 0 },
  lastSearchedAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Medicine', medicineSchema)
