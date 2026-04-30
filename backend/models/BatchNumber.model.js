import mongoose from 'mongoose'

const batchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  medicine: { type: String, required: true },
  manufacturer: { type: String, required: true },
  manufacturingDate: Date,
  expiryDate: { type: String },
  status: { 
    type: String, 
    enum: ['RECALLED', 'UNDER_INVESTIGATION', 'NOT_LISTED'],
    default: 'NOT_LISTED'
  },
  recallDate: { type: String },
  recallReason: { type: String },
  recallAuthority: { type: String },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  affectedStates: [String],
  sourceUrl: { type: String }
}, { timestamps: true })

export default mongoose.model('BatchNumber', batchSchema)
