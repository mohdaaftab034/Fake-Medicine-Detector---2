import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['alert', 'report_update', 'chemist_verification', 'system', 'recall']
  },
  isRead: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
