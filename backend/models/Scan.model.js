import mongoose from 'mongoose'

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  result: {
    type: String,
    enum: ['LOOKS_PROFESSIONAL', 'HAS_ISSUES', 'UNCLEAR', 'GENUINE', 'FAKE', 'SUSPICIOUS'],
    required: true
  },
  confidence: { type: Number, min: 0, max: 100 },
  reasons: [{ type: String }],
  recommendations: [{ type: String }],
  medicineDetails: {
    name: String,
    manufacturer: String,
    category: String,
    estimatedMRP: String
  },
  batchNumber: { type: String },
  batchStatus: { 
    type: String, 
    enum: ['NOT_CHECKED', 'NOT_DETECTED', 'RECALLED', 'UNDER_INVESTIGATION', 'NOT_IN_RECALLED_LIST'],
    default: 'NOT_CHECKED'
  },
  batchDetails: { type: mongoose.Schema.Types.Mixed },
  medicineDbResult: { type: mongoose.Schema.Types.Mixed },
  nearbyChemists: [{ type: mongoose.Schema.Types.Mixed }],
  riskLevel: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  analysisText: String,
  isReported: { type: Boolean, default: false },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
}, { timestamps: true })

export default mongoose.model('Scan', scanSchema)
