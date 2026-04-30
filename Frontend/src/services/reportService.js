import { generateCaseId } from '../utils/helpers.js';

// Simulated API call with delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const submitReport = async (reportData) => {
  console.log('📝 Submitting fake medicine report:', reportData);
  
  await delay(2000);

  const caseId = generateCaseId();

  return {
    success: true,
    data: {
      caseId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      message: 'Your report has been forwarded to CDSCO and State Drug Authority',
      reference: `REF-${caseId}`,
      estimatedResolutionTime: '7-14 business days',
    },
  };
};

export const getReportStatus = async (caseId) => {
  console.log('🔎 Fetching report status for:', caseId);
  
  await delay(1000);

  const statuses = ['submitted', 'investigating', 'confirmed', 'action-taken'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    success: true,
    data: {
      caseId,
      status: randomStatus,
      lastUpdated: new Date().toISOString(),
      details:
        randomStatus === 'confirmed'
          ? 'Fake medicine confirmed. Medicine batch has been recalled.'
          : 'Investigation in progress',
    },
  };
};

export const uploadReportEvidence = async (file) => {
  console.log('📎 Uploading evidence file:', file.name);
  
  await delay(1500);

  return {
    success: true,
    data: {
      fileId: `FILE-${Date.now()}`,
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    },
  };
};

export const getRecentReports = async (limit = 10) => {
  console.log('📊 Fetching recent reports, limit:', limit);
  
  await delay(1200);

  // Generate mock reports
  const reports = Array.from({ length: limit }, (_, i) => ({
    id: `RPT${String(i + 1).padStart(4, '0')}`,
    medicineName: `Medicine ${i + 1}`,
    batch: `BATCH${String(i + 1).padStart(6, '0')}`,
    location: `City ${i + 1}`,
    status: ['submitted', 'investigating', 'confirmed'][Math.floor(Math.random() * 3)],
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return {
    success: true,
    data: reports,
  };
};
