import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import Medicine from '../models/Medicine.model.js'
import BatchNumber from '../models/BatchNumber.model.js'
import Alert from '../models/Alert.model.js'
import Chemist from '../models/Chemist.model.js'
import { connectDB } from '../config/db.js'

dotenv.config()

export const runSeed = async () => {
  try {
    console.log('Seeding data...')

    // 1. Create Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mediguard.in'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
    
    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(adminPassword, salt)
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      })
      console.log('Admin user created')
    } else {
      console.log('Admin user already exists')
    }

    // 2. Insert Indian Medicines (30 Mock)
    const medicines = []
    for (let i = 1; i <= 30; i++) {
      medicines.push({
        name: `Medicine-${i}`,
        genericName: `Generic-${i}`,
        manufacturer: `PharmaCorp-${(i % 5) + 1}`,
        category: ['tablet', 'syrup', 'injection', 'capsule'][i % 4],
        mrp: 10 * i,
        description: `This is a mock description for Medicine-${i}`
      })
    }
    
    for (const med of medicines) {
      await Medicine.findOneAndUpdate({ name: med.name }, med, { upsert: true, returnDocument: 'after' })
    }
    console.log('30 Medicines seeded')

    // 3. Insert recalled and under-investigation batches
    const batches = [
      { batchNumber: 'BN2024001', medicine: 'Paracetamol 500mg', manufacturer: 'XYZ Pharma Pvt Ltd', expiryDate: '12/2025', status: 'RECALLED', recallDate: '2024-03-15', recallReason: 'Failed dissolution test — medicine not dissolving properly in body', recallAuthority: 'CDSCO', severity: 'HIGH', affectedStates: ['Uttar Pradesh', 'Bihar', 'Delhi'] },
      { batchNumber: 'BN2024002', medicine: 'Azithromycin 500mg', manufacturer: 'ABC Laboratories', expiryDate: '06/2025', status: 'RECALLED', recallDate: '2024-05-20', recallReason: 'Substandard quality — active ingredient below specified limit', recallAuthority: 'Maharashtra FDA', severity: 'CRITICAL', affectedStates: ['Maharashtra', 'Gujarat', 'Goa'] },
      { batchNumber: 'BN2024003', medicine: 'Metformin 500mg', manufacturer: 'PQR Drugs Ltd', expiryDate: '09/2025', status: 'RECALLED', recallDate: '2024-07-10', recallReason: 'Contamination detected in manufacturing batch', recallAuthority: 'CDSCO', severity: 'CRITICAL', affectedStates: ['All States'] },
      { batchNumber: 'BN2023001', medicine: 'Amoxicillin 250mg Syrup', manufacturer: 'DEF Pharma', expiryDate: '03/2025', status: 'RECALLED', recallDate: '2023-11-01', recallReason: 'Microbial contamination found', recallAuthority: 'UP Drug Authority', severity: 'HIGH', affectedStates: ['Uttar Pradesh', 'Madhya Pradesh'] },
      { batchNumber: 'BN2024004', medicine: 'Cefixime 200mg', manufacturer: 'GHI Life Sciences', expiryDate: '11/2025', status: 'UNDER_INVESTIGATION', recallDate: null, recallReason: 'Under quality investigation by state authority', recallAuthority: 'Delhi Drug Authority', severity: 'MEDIUM', affectedStates: ['Delhi', 'Haryana'] }
    ]
    
    for (const batch of batches) {
      await BatchNumber.findOneAndUpdate({ batchNumber: batch.batchNumber }, batch, { upsert: true, returnDocument: 'after' })
    }
    console.log('5 recalled/investigation batches seeded')

    // 4. Insert 8 CDSCO alerts
    const alerts = []
    for (let i = 1; i <= 8; i++) {
      alerts.push({
        title: `CDSCO Spurious Drug Alert #${i}`,
        description: `Alert regarding spurious batches of Medicine-${i}. Please be cautious.`,
        severity: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
        affectedStates: ['Maharashtra', 'Delhi', 'Karnataka'],
        affectedMedicine: `Medicine-${i}`,
        createdBy: admin._id
      })
    }
    
    for (const alert of alerts) {
      await Alert.findOneAndUpdate({ title: alert.title }, alert, { upsert: true, returnDocument: 'after' })
    }
    console.log('8 CDSCO alerts seeded')

    // 5. Insert 5 Demo Chemists
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
    const chemists = []
    for (let i = 0; i < 5; i++) {
      let cUser = await User.findOne({ email: `chemist${i}@mediguard.in` })
      if (!cUser) {
        const salt = await bcrypt.genSalt(10)
        const hp = await bcrypt.hash('Chemist@123', salt)
        cUser = await User.create({
          name: `Chemist ${i}`,
          email: `chemist${i}@mediguard.in`,
          password: hp,
          role: 'chemist',
          city: cities[i],
          state: cities[i]
        })
      }
      
      chemists.push({
        user: cUser._id,
        shopName: `MediShop ${cities[i]}`,
        licenseNumber: `LIC-CHM-${i}00X`,
        address: `123 Main St, ${cities[i]}`,
        city: cities[i],
        state: cities[i],
        pincode: `40000${i}`,
        phone: `987654321${i}`,
        isVerified: true
      })
    }
    
    for (const chemist of chemists) {
      await Chemist.findOneAndUpdate({ licenseNumber: chemist.licenseNumber }, chemist, { upsert: true, returnDocument: 'after' })
    }
    console.log('5 Demo chemists seeded')

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

// If executed directly, run it and exit
if (process.argv[1] && process.argv[1].includes('seedData.js')) {
  connectDB().then(async () => {
    await runSeed()
    process.exit(0)
  })
}
