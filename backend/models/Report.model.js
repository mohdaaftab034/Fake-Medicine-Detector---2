import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAnonymous: { type: Boolean, default: false },
  medicine: {
    name: { type: String, required: true },
    batchNumber: String,
    manufacturer: String,
    purchaseDate: Date,
    mrpPaid: Number
  },
  chemistShop: {
    name: String,
    address: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: String
  },
  evidence: {
    medicineImages: [String],
    receiptImage: String
  },
  scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
  status: { 
    type: String, 
    enum: ['pending', 'under_investigation', 'confirmed_fake', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: String,
  caseId: { type: String, unique: true },
  forwardedToCDSCO: { type: Boolean, default: false },
  forwardedToPolice: { type: Boolean, default: false },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' }
}, { timestamps: true })

export default mongoose.model('Report', reportSchema)
