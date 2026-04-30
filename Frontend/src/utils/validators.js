export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

export const validateBatchNumber = (batch) => {
  return batch.trim().length >= 3;
};

export const validateMedicineName = (name) => {
  return name.trim().length >= 2;
};

export const validateManufacturer = (manufacturer) => {
  return manufacturer.trim().length >= 2;
};

export const validateCity = (city) => {
  return city.trim().length >= 2;
};

export const validateState = (state) => {
  return state.trim().length >= 2;
};

export const validatePincode = (pincode) => {
  const regex = /^[0-9]{6}$/;
  return regex.test(pincode.replace(/\D/g, ''));
};

export const validateImageFile = (file) => {
  return file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024; // 20MB max
};

export const validateForm = (formData, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateMedicineDetails = (data) => {
  const errors = {};

  if (!validateMedicineName(data.name)) {
    errors.name = 'Please enter a valid medicine name';
  }

  if (!validateBatchNumber(data.batch)) {
    errors.batch = 'Please enter a valid batch number';
  }

  if (!validateManufacturer(data.manufacturer)) {
    errors.manufacturer = 'Please enter a valid manufacturer name';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateReportForm = (data) => {
  const errors = {};

  if (!validateMedicineName(data.medicineName)) {
    errors.medicineName = 'Please enter a valid medicine name';
  }

  if (!validateBatchNumber(data.batch)) {
    errors.batch = 'Please enter a valid batch number';
  }

  if (!validateCity(data.city)) {
    errors.city = 'Please enter a valid city name';
  }

  if (!validateState(data.state)) {
    errors.state = 'Please enter a valid state name';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
