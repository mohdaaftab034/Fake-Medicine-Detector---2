import api from './api';

const API_URL = '/scan';

export const scanMedicine = async (imageFile, batchNumber = '') => {
  const formData = new FormData();
  formData.append('medicineImage', imageFile);
  if (batchNumber) {
    formData.append('batchNumber', batchNumber);
  }

  // Add dummy location for hackathon demo
  formData.append('location[city]', 'Bangalore');
  formData.append('location[state]', 'Karnataka');

  const response = await api.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });

  return response.data;
};

export const getScanHistory = async () => {
  const response = await api.get(`${API_URL}/history`);
  return response.data;
};

export const chatFollowUp = async (question, context) => {
  const response = await api.post(`${API_URL}/chat`, { question, context });
  return response.data;
};

export const verifyBatch = async (batchNumber) => {
  const response = await api.get(`/batch/verify?batch=${encodeURIComponent(batchNumber)}`);
  return response.data;
};
