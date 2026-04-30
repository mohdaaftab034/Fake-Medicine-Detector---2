export const ROUTES = {
  HOME: '/',
  SCANNER: '/scanner',
  BATCH_VERIFY: '/batch-verify',
  REPORT_FAKE: '/report-fake',
  MEDICINE_INFO: '/medicine-info',
  NEARBY_CHEMIST: '/nearby-chemist',
  DASHBOARD: '/dashboard',
  ALERTS: '/alerts',
  NOT_FOUND: '/404',
};

export const MEDICINE_CATEGORIES = ['tablet', 'syrup', 'injection', 'capsule', 'gel', 'lozenge', 'powder'];

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const ALERT_MESSAGES = {
  SUCCESS: 'Operation successful!',
  ERROR: 'An error occurred. Please try again.',
  LOADING: 'Loading...',
  UPLOADING: 'Uploading file...',
  SCANNING: 'Scanning medicine...',
  VERIFYING: 'Verifying batch...',
  SUBMITTING: 'Submitting report...',
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const CDSCO_HELPLINE = '1800-180-3024';
