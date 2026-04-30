import { MEDICINES } from '../utils/mockData.js';

// Simulated API call with delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchMedicines = async (query) => {
  console.log('🔍 Searching medicines for:', query);
  
  await delay(800);

  if (!query || query.trim() === '') {
    return {
      success: true,
      data: MEDICINES,
    };
  }

  const filtered = MEDICINES.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(query.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(query.toLowerCase())
  );

  return {
    success: true,
    data: filtered,
  };
};

export const getMedicineDetails = async (medicineId) => {
  console.log('💊 Fetching medicine details for ID:', medicineId);
  
  await delay(1000);

  const medicine = MEDICINES.find((m) => m.id === parseInt(medicineId));

  if (medicine) {
    return {
      success: true,
      data: {
        ...medicine,
        fullDescription: `${medicine.name} is manufactured by ${medicine.manufacturer}. This medicine falls under the ${medicine.category} category.`,
        packagingGuide: 'Look for hologram on the package. Check QR code validity.',
        interactionWarnings: [
          'May interact with other medications',
          'Consult pharmacist before use',
          'Check expiry before consumption',
        ],
      },
    };
  }

  return {
    success: false,
    error: 'Medicine not found',
  };
};

export const getPopularMedicines = async () => {
  console.log('🏆 Fetching popular medicines...');
  
  await delay(1000);

  return {
    success: true,
    data: MEDICINES.sort(() => Math.random() - 0.5).slice(0, 6),
  };
};

export const checkMedicineAvailability = async (medicineName, city) => {
  console.log('📍 Checking availability for:', medicineName, 'in', city);
  
  await delay(1200);

  return {
    success: true,
    data: {
      medicineName,
      city,
      available: true,
      nearbyChemists: 5,
      averagePrice: Math.floor(Math.random() * 100 + 50),
      lastUpdated: new Date().toISOString(),
    },
  };
};
