import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  affectedStates: [String],
  affectedMedicine: String,
  batchNumbers: [String],
  manufacturer: String,
  source: { type: String, default: 'CDSCO' },
  sourceUrl: String,
  actionRequired: String,
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

export default mongoose.model('Alert', alertSchema)
