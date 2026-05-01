import axios from 'axios'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, ApiError } from '../utils/apiResponse.js'
import { askGroq } from '../services/groq.service.js'
import Medicine from '../models/Medicine.model.js'

// Clean FDA text — it comes in ALL CAPS and messy format
const cleanText = (text) => {
  if (!text || text === 'Not available') return 'Not available'
  return text
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 800)
}

// Format raw FDA result into clean object
const formatFDAResult = (result) => {
  const openfda = result.openfda || {}
  return {
    id: result.id || String(Math.random()),
    name: openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown',
    genericName: openfda.generic_name?.[0] || 'Not available',
    manufacturer: openfda.manufacturer_name?.[0] || 'Not available',
    category: openfda.product_type?.[0] || 'Not specified',
    dosageForm: openfda.dosage_form?.[0] || 'Not specified',
    route: openfda.route?.[0] || 'Not specified',
    substanceName: openfda.substance_name?.[0] || 'Not specified',
    requiresPrescription: openfda.product_type?.[0] === 'PRESCRIPTION',
    ndc: openfda.product_ndc?.[0] || 'Not available',
    indications: cleanText(result.indications_and_usage?.[0]),
    dosageInstructions: cleanText(result.dosage_and_administration?.[0]),
    warnings: cleanText(result.warnings?.[0] || result.warnings_and_cautions?.[0]),
    sideEffects: cleanText(result.adverse_reactions?.[0]),
    contraindications: cleanText(result.contraindications?.[0]),
    drugInteractions: cleanText(result.drug_interactions?.[0]),
    storageInstructions: cleanText(result.storage_and_handling?.[0]),
    description: cleanText(result.description?.[0]),
    source: 'OpenFDA'
  }
}

// Search by brand name first, then generic name as fallback
const fetchFromFDA = async (query) => {
  const encoded = encodeURIComponent(query)

  try {
    // Try brand name first
    const res1 = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encoded}"&limit=6`,
      { timeout: 10000 }
    )
    if (res1.data?.results?.length > 0) return res1.data.results
  } catch (e) {}

  try {
    // Try generic name
    const res2 = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encoded}"&limit=6`,
      { timeout: 10000 }
    )
    if (res2.data?.results?.length > 0) return res2.data.results
  } catch (e) {}

  try {
    // Try broad search as last fallback
    const res3 = await axios.get(
      `https://api.fda.gov/drug/label.json?search="${encoded}"&limit=6`,
      { timeout: 10000 }
    )
    if (res3.data?.results?.length > 0) return res3.data.results
  } catch (e) {}

  return []
}

// GET /api/v1/medicines/search?query=paracetamol
export const searchMedicine = asyncHandler(async (req, res) => {
  const query = req.query.query?.trim()

  if (!query || query.length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters')
  }

  console.log('[MEDICINE] Searching:', query)

  // Check Indian medicines local list first
  const localResults = indianMedicines.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase())
  )

  // Call OpenFDA
  const fdaResults = await fetchFromFDA(query)
  const formatted = fdaResults.map(formatFDAResult)
  
  const finalResults = [...localResults, ...formatted]

  if (finalResults.length === 0) {
    return res.json(new ApiResponse(200, [], 'No medicines found. Try generic name like paracetamol instead of Crocin'))
  }

  // Save each result to Medicine model if not already exists
  for (const med of finalResults.slice(0, 3)) {
    await Medicine.findOneAndUpdate(
      { name: med.name, manufacturer: med.manufacturer },
      {
        $set: {
          name: med.name,
          genericName: med.genericName,
          manufacturer: med.manufacturer,
          category: med.category,
          dosageForm: med.dosageForm,
          requiresPrescription: med.requiresPrescription,
          indications: med.indications,
          warnings: med.warnings,
          sideEffects: med.sideEffects,
          drugInteractions: med.drugInteractions,
          storageInstructions: med.storageInstructions,
          description: med.description,
          source: med.source || 'OpenFDA',
          lastSearchedAt: new Date()
        },
        $inc: { searchCount: 1 }
      },
      { upsert: true, returnDocument: 'after' }
    )
  }
  console.log(`[MEDICINE] Saved ${Math.min(finalResults.length, 3)} medicines to database`)

  return res.json(new ApiResponse(200, finalResults, 'Search results'))
})

// GET /api/v1/medicines/:id
export const getMedicineDetail = asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const medicine = await Medicine.findById(id)
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found')
  }

  medicine.searchCount += 1
  medicine.lastSearchedAt = new Date()
  await medicine.save()

  return res.json(new ApiResponse(200, medicine, 'Medicine details fetched'))
})

// GET /api/v1/medicines/suggestions?query=para
export const getMedicineSuggestions = asyncHandler(async (req, res) => {
  const query = req.query.query?.trim()

  if (!query || query.length < 2) {
    return res.json(new ApiResponse(200, []))
  }

  // Check local first
  const localSuggestions = indianMedicines
    .filter((m) => m.name.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 6)
    .map((m) => ({ name: m.name, manufacturer: m.manufacturer, form: m.dosageForm }))

  if (localSuggestions.length >= 3) {
    return res.json(new ApiResponse(200, localSuggestions))
  }

  // Call OpenFDA for suggestions
  try {
    const response = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(query)}*&limit=8`,
      { timeout: 8000 }
    )

    const suggestions = (response.data?.results || [])
      .map((r) => ({
        name: r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || '',
        manufacturer: r.openfda?.manufacturer_name?.[0] || '',
        form: r.openfda?.dosage_form?.[0] || ''
      }))
      .filter((s) => s.name)

    return res.json(new ApiResponse(200, [...localSuggestions, ...suggestions].slice(0, 8)))
  } catch {
    return res.json(new ApiResponse(200, localSuggestions))
  }
})

// POST /api/v1/medicines/ask-ai
export const askMedicineAI = asyncHandler(async (req, res) => {
  const { question, medicine } = req.body

  if (!question || String(question).trim().length < 2) {
    throw new ApiError(400, 'Please provide a valid question')
  }

  const med = medicine || {}
  const context = `Medicine context:
Name: ${med.name || 'Not available'}
Generic Name: ${med.genericName || 'Not available'}
Manufacturer: ${med.manufacturer || 'Not available'}
Category: ${med.category || 'Not available'}
Dosage Form: ${med.dosageForm || 'Not available'}
Route: ${med.route || 'Not available'}
Active Substance: ${med.substanceName || 'Not available'}
Indications: ${med.indications || 'Not available'}
Dosage Instructions: ${med.dosageInstructions || 'Not available'}
Warnings: ${med.warnings || 'Not available'}
Side Effects: ${med.sideEffects || 'Not available'}
Contraindications: ${med.contraindications || 'Not available'}
Drug Interactions: ${med.drugInteractions || 'Not available'}
Storage: ${med.storageInstructions || 'Not available'}
Source: ${med.source || 'Unknown'}

Answer the user question specifically for this medicine in clear, practical language.
If uncertain, say so clearly and recommend pharmacist/doctor confirmation.`

  const response = await askGroq(String(question).trim(), [], context)
  return res.json(new ApiResponse(200, { response }, 'AI answer generated'))
})

// Local Indian medicines data — top 30 common medicines
const indianMedicines = [
  { id: 'IN001', name: 'Crocin', genericName: 'Paracetamol', manufacturer: 'GSK', category: 'OTC', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Paracetamol 500mg', requiresPrescription: false, indications: 'Fever, mild to moderate pain relief', dosageInstructions: '1-2 tablets every 4-6 hours. Maximum 8 tablets per day.', warnings: 'Do not exceed recommended dose. Avoid alcohol.', sideEffects: 'Rare: skin rash, liver damage on overdose', contraindications: 'Severe liver disease', drugInteractions: 'Warfarin, alcohol', storageInstructions: 'Store below 25C, away from moisture', description: 'Common fever and pain relief medicine', source: 'Local' },
  { id: 'IN002', name: 'Dolo 650', genericName: 'Paracetamol', manufacturer: 'Micro Labs', category: 'OTC', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Paracetamol 650mg', requiresPrescription: false, indications: 'Fever, headache, body ache, cold and flu symptoms', dosageInstructions: '1 tablet every 6-8 hours. Maximum 4 tablets per day.', warnings: 'Do not take with other paracetamol products. Avoid overdose.', sideEffects: 'Generally well tolerated. Rare: nausea, liver issues on overdose', contraindications: 'Liver disease, alcohol dependence', drugInteractions: 'Warfarin, rifampicin', storageInstructions: 'Store in cool dry place below 30C', description: 'Higher strength paracetamol tablet for fever and pain', source: 'Local' },
  { id: 'IN003', name: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', manufacturer: 'Sanofi', category: 'OTC', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Ibuprofen 400mg + Paracetamol 325mg', requiresPrescription: false, indications: 'Pain, fever, inflammation, headache, toothache', dosageInstructions: '1 tablet 2-3 times daily after food', warnings: 'Take after food. Avoid in stomach ulcers. Not for children under 12.', sideEffects: 'Nausea, stomach upset, heartburn', contraindications: 'Peptic ulcer, kidney disease, third trimester pregnancy', drugInteractions: 'Aspirin, blood thinners, diuretics', storageInstructions: 'Store below 30C', description: 'Combination pain and fever relief tablet', source: 'Local' },
  { id: 'IN004', name: 'Pan 40', genericName: 'Pantoprazole', manufacturer: 'Alkem', category: 'PRESCRIPTION', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Pantoprazole 40mg', requiresPrescription: true, indications: 'Acidity, GERD, stomach ulcers, acid reflux', dosageInstructions: '1 tablet daily before breakfast on empty stomach', warnings: 'Long term use may reduce magnesium levels. Consult doctor.', sideEffects: 'Headache, diarrhea, nausea, abdominal pain', contraindications: 'Hypersensitivity to proton pump inhibitors', drugInteractions: 'Atazanavir, ketoconazole, warfarin', storageInstructions: 'Store below 25C in original packaging', description: 'Proton pump inhibitor for acid related disorders', source: 'Local' },
  { id: 'IN005', name: 'Azithral 500', genericName: 'Azithromycin', manufacturer: 'Alembic', category: 'PRESCRIPTION', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Azithromycin 500mg', requiresPrescription: true, indications: 'Bacterial infections, respiratory infections, throat infections, typhoid', dosageInstructions: '1 tablet daily for 3-5 days as directed by doctor', warnings: 'Complete full course. Do not skip doses. Avoid antacids within 2 hours.', sideEffects: 'Nausea, vomiting, diarrhea, abdominal pain', contraindications: 'Liver disease, known hypersensitivity to macrolides', drugInteractions: 'Warfarin, digoxin, antacids', storageInstructions: 'Store below 30C away from light', description: 'Macrolide antibiotic for bacterial infections', source: 'Local' },
  { id: 'IN006', name: 'Metformin 500', genericName: 'Metformin', manufacturer: 'Various', category: 'PRESCRIPTION', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Metformin HCl 500mg', requiresPrescription: true, indications: 'Type 2 diabetes management, blood sugar control', dosageInstructions: '1 tablet twice daily with meals as directed by doctor', warnings: 'Do not use in kidney disease. Stop before surgery or contrast dye procedure.', sideEffects: 'Nausea, diarrhea, stomach upset, lactic acidosis (rare)', contraindications: 'Renal impairment, liver disease, heart failure', drugInteractions: 'Alcohol, contrast dye, diuretics', storageInstructions: 'Store below 25C', description: 'First line oral medication for type 2 diabetes', source: 'Local' },
  { id: 'IN007', name: 'Cetirizine', genericName: 'Cetirizine', manufacturer: 'Various', category: 'OTC', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Cetirizine 10mg', requiresPrescription: false, indications: 'Allergic rhinitis, urticaria, hay fever, skin allergies', dosageInstructions: '1 tablet once daily at bedtime', warnings: 'May cause drowsiness. Avoid driving. Avoid alcohol.', sideEffects: 'Drowsiness, dry mouth, headache', contraindications: 'Severe kidney disease', drugInteractions: 'Alcohol, sedatives, theophylline', storageInstructions: 'Store below 30C', description: 'Second generation antihistamine for allergy relief', source: 'Local' },
  { id: 'IN008', name: 'Omeprazole 20', genericName: 'Omeprazole', manufacturer: 'Various', category: 'OTC', dosageForm: 'Capsule', route: 'Oral', substanceName: 'Omeprazole 20mg', requiresPrescription: false, indications: 'Acidity, heartburn, GERD, stomach ulcers', dosageInstructions: '1 capsule daily before breakfast', warnings: 'Do not crush or chew capsule. Long term use needs doctor supervision.', sideEffects: 'Headache, diarrhea, nausea, abdominal pain', contraindications: 'Hypersensitivity to omeprazole', drugInteractions: 'Clopidogrel, methotrexate, ketoconazole', storageInstructions: 'Store below 25C in dry place', description: 'Proton pump inhibitor for acidity and ulcers', source: 'Local' },
  { id: 'IN009', name: 'Montair LC', genericName: 'Montelukast + Levocetirizine', manufacturer: 'Cipla', category: 'PRESCRIPTION', dosageForm: 'Tablet', route: 'Oral', substanceName: 'Montelukast 10mg + Levocetirizine 5mg', requiresPrescription: true, indications: 'Allergic rhinitis, asthma, chronic urticaria', dosageInstructions: '1 tablet daily at bedtime', warnings: 'May cause drowsiness. Monitor for mood changes.', sideEffects: 'Drowsiness, headache, dry mouth, mood changes', contraindications: 'Phenylketonuria', drugInteractions: 'Phenobarbital, rifampicin', storageInstructions: 'Store below 30C away from light', description: 'Combination allergy and asthma medicine', source: 'Local' },
  { id: 'IN010', name: 'Digene', genericName: 'Aluminium Hydroxide + Magnesium Hydroxide', manufacturer: 'Abbott', category: 'OTC', dosageForm: 'Tablet/Gel', route: 'Oral', substanceName: 'Aluminium Hydroxide 830mg + Magnesium Hydroxide 185mg', requiresPrescription: false, indications: 'Acidity, heartburn, indigestion, gas, bloating', dosageInstructions: '1-2 tablets or 2 teaspoons gel after meals and at bedtime', warnings: 'Do not use continuously for more than 2 weeks without consulting doctor.', sideEffects: 'Constipation, diarrhea, nausea', contraindications: 'Kidney disease, low phosphate levels', drugInteractions: 'Tetracyclines, iron, fluoroquinolones', storageInstructions: 'Store below 30C', description: 'Antacid for immediate relief from acidity and gas', source: 'Local' }
]
