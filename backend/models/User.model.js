import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String },
  role: { type: String, enum: ['public', 'chemist', 'admin'], default: 'public' },
  city: { type: String },
  state: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  savedMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  lastLogin: { type: Date },
  refreshToken: { type: String }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
