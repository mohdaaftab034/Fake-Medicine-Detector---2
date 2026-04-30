import mongoose from 'mongoose'

import { MongoMemoryServer } from 'mongodb-memory-server'

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...')
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    })
    console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`)
    return process.env.MONGODB_URI
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`)
    console.warn('Falling back to local in-memory MongoDB for development...')
    
    try {
      const mongod = await MongoMemoryServer.create()
      const uri = mongod.getUri()
      const conn = await mongoose.connect(uri)
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`)
      return uri
    } catch (memError) {
      console.error(`Critical: Memory Server failed too: ${memError.message}`)
      process.exit(1)
    }
  }
}
