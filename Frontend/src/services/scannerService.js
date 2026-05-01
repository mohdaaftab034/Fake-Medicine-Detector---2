import api from './api';

const API_URL = '/scan';

export const scanMedicine = async (imageFile, lat, lng) => {
  const formData = new FormData();
  formData.append('medicineImage', imageFile);
  if (lat) formData.append('lat', lat);
  if (lng) formData.append('lng', lng);

  const response = await api.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });

  return response.data;
};

export const getScanHistory = async (page = 1, limit = 20) => {
  const response = await api.get(`${API_URL}/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const chatFollowUp = async (question, history = [], currentScanId = null) => {
  const response = await api.post(`${API_URL}/chat`, { question, history, currentScanId });
  return response.data;
};

export const getScanById = async (scanId) => {
  const response = await api.get(`${API_URL}/history/${scanId}`);
  return response.data;
};

export const verifyBatch = async (batchNumber) => {
  const response = await api.get(`/batch/verify?batch=${encodeURIComponent(batchNumber)}`);
  return response.data;
};
