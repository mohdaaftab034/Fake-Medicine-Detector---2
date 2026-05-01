import express from 'express'
import { searchMedicine, getMedicineSuggestions, askMedicineAI, getMedicineDetail } from '../controllers/medicine.controller.js'

const router = express.Router()

router.get('/search', searchMedicine)
router.get('/suggestions', getMedicineSuggestions)
router.post('/ask-ai', askMedicineAI)
router.get('/:id', getMedicineDetail)

export default router
