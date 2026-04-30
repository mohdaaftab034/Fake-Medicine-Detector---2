import express from 'express'
import { searchMedicine, getMedicineSuggestions, askMedicineAI } from '../controllers/medicine.controller.js'

const router = express.Router()

router.get('/search', searchMedicine)
router.get('/suggestions', getMedicineSuggestions)
router.post('/ask-ai', askMedicineAI)

export default router
