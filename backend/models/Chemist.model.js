import mongoose from 'mongoose'

const chemistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: String,
  documents: {
    licenseImage: String,
    shopImage: String
  },
  operatingHours: {
    open: String,
    close: String,
    days: [String]
  }
}, { timestamps: true })

export default mongoose.model('Chemist', chemistSchema)
