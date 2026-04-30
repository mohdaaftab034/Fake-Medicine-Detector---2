export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString) => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'genuine':
      return 'text-success';
    case 'fake':
      return 'text-danger';
    case 'suspicious':
      return 'text-warning';
    default:
      return 'text-text-secondary';
  }
};

export const getStatusBgColor = (status) => {
  switch (status) {
    case 'genuine':
      return 'bg-success/20';
    case 'fake':
      return 'bg-danger/20';
    case 'suspicious':
      return 'bg-warning/20';
    default:
      return 'bg-bg-secondary';
  }
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'text-danger';
    case 'high':
      return 'text-warning';
    case 'medium':
      return 'text-primary';
    case 'low':
      return 'text-success';
    default:
      return 'text-text-secondary';
  }
};

export const getSeverityBgColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-danger/20';
    case 'high':
      return 'bg-warning/20';
    case 'medium':
      return 'bg-primary/20';
    case 'low':
      return 'bg-success/20';
    default:
      return 'bg-bg-secondary';
  }
};

export const generateCaseId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASE-${timestamp}-${random}`;
};

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const highlightText = (text, highlight) => {
  if (!highlight) return text;
  const regex = new RegExp(`(${highlight})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
