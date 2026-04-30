import mongoose from 'mongoose'

import { MongoMemoryServer } from 'mongodb-memory-server'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return process.env.MONGODB_URI
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}
