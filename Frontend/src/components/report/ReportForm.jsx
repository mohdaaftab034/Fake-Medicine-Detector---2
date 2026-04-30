import React, { useState } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportForm = ({ onSubmit, loading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    medicineName: '',
    batch: '',
    manufacturer: '',
    purchaseDate: '',
    mrpPaid: '',
    photoUrl: '',
    receiptUrl: '',
    chemistName: '',
    chemistAddress: '',
    city: '',
    state: '',
    reporterName: '',
    reporterPhone: '',
    anonymous: true,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
      if (!formData.batch.trim()) newErrors.batch = 'Batch number is required';
      if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer name is required';
      if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
      if (!formData.mrpPaid) newErrors.mrpPaid = 'MRP paid is required';
    }

    if (step === 2) {
      if (!formData.chemistName.trim()) newErrors.chemistName = 'Chemist shop name is required';
      if (!formData.chemistAddress.trim()) newErrors.chemistAddress = 'Shop address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
    }

    if (step === 3) {
      if (!formData.anonymous && !formData.reporterPhone.trim()) {
        newErrors.reporterPhone = 'Phone number is required if not anonymous';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Medicine Details',
      description: 'Provide information about the fake medicine',
    },
    {
      number: 2,
      title: 'Evidence & Location',
      description: 'Upload proof and mention where you bought it',
    },
    {
      number: 3,
      title: 'Your Details',
      description: 'Optional: Provide your contact information',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <motion.div
              animate={{
                backgroundColor:
                  step.number <= currentStep ? 'rgba(0, 180, 216, 1)' : 'rgba(31, 41, 55, 1)',
                borderColor: step.number <= currentStep ? 'rgba(0, 180, 216, 1)' : 'rgba(31, 41, 55, 1)',
              }}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold mb-2"
            >
              {step.number}
            </motion.div>
            <p className="text-xs text-text-secondary text-center max-w-20">
              {step.title}
            </p>
            {step.number < 3 && (
              <div
                className={`h-0.5 flex-1 mt-4 ${
                  step.number < currentStep ? 'bg-primary' : 'bg-border-color'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Step 1: Medicine Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 flex gap-3">
                <AlertTriangle className="text-danger flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-danger mb-1">Report Fake Medicines</p>
                  <p className="text-danger/80 text-sm">
                    Your report helps protect millions of people. All information will be verified and forwarded to CDSCO.
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Medicine Name *</span>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  placeholder="e.g., Aspirin 500mg"
                  className="input-field"
                />
                {errors.medicineName && <p className="text-danger text-sm mt-1">{errors.medicineName}</p>}
              </label>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Batch Number *</span>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  placeholder="Batch number from the packet"
                  className="input-field"
                />
                {errors.batch && <p className="text-danger text-sm mt-1">{errors.batch}</p>}
              </label>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Manufacturer Name *</span>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="Medicine manufacturer"
                  className="input-field"
                />
                {errors.manufacturer && <p className="text-danger text-sm mt-1">{errors.manufacturer}</p>}
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-text-secondary text-sm mb-2 block">Purchase Date *</span>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                  {errors.purchaseDate && <p className="text-danger text-sm mt-1">{errors.purchaseDate}</p>}
                </label>

                <label className="block">
                  <span className="text-text-secondary text-sm mb-2 block">MRP Paid (₹) *</span>
                  <input
                    type="number"
                    name="mrpPaid"
                    value={formData.mrpPaid}
                    onChange={handleInputChange}
                    placeholder="Amount paid"
                    className="input-field"
                  />
                  {errors.mrpPaid && <p className="text-danger text-sm mt-1">{errors.mrpPaid}</p>}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Evidence & Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Upload Medicine Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      photoUrl: e.target.files?.[0]?.name || '',
                    }))
                  }
                  className="input-field"
                />
                {formData.photoUrl && (
                  <p className="text-success text-sm mt-2">✓ File selected: {formData.photoUrl}</p>
                )}
              </label>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Receipt/Bill Photo (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiptUrl: e.target.files?.[0]?.name || '',
                    }))
                  }
                  className="input-field"
                />
                {formData.receiptUrl && (
                  <p className="text-success text-sm mt-2">✓ File selected: {formData.receiptUrl}</p>
                )}
              </label>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Chemist Shop Name *</span>
                <input
                  type="text"
                  name="chemistName"
                  value={formData.chemistName}
                  onChange={handleInputChange}
                  placeholder="Name of the chemist shop"
                  className="input-field"
                />
                {errors.chemistName && <p className="text-danger text-sm mt-1">{errors.chemistName}</p>}
              </label>

              <label className="block">
                <span className="text-text-secondary text-sm mb-2 block">Shop Address *</span>
                <input
                  type="text"
                  name="chemistAddress"
                  value={formData.chemistAddress}
                  onChange={handleInputChange}
                  placeholder="Complete shop address"
                  className="input-field"
                />
                {errors.chemistAddress && <p className="text-danger text-sm mt-1">{errors.chemistAddress}</p>}
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-text-secondary text-sm mb-2 block">City *</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City name"
                    className="input-field"
                  />
                  {errors.city && <p className="text-danger text-sm mt-1">{errors.city}</p>}
                </label>

                <label className="block">
                  <span className="text-text-secondary text-sm mb-2 block">State *</span>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State name"
                    className="input-field"
                  />
                  {errors.state && <p className="text-danger text-sm mt-1">{errors.state}</p>}
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Reporter Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-bg-secondary border-border-color accent-primary cursor-pointer"
                />
                <span className="text-text-primary">Report Anonymously</span>
              </label>

              {!formData.anonymous && (
                <>
                  <label className="block">
                    <span className="text-text-secondary text-sm mb-2 block">Your Name (Optional)</span>
                    <input
                      type="text"
                      name="reporterName"
                      value={formData.reporterName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="input-field"
                    />
                  </label>

                  <label className="block">
                    <span className="text-text-secondary text-sm mb-2 block">Phone Number *</span>
                    <input
                      type="tel"
                      name="reporterPhone"
                      value={formData.reporterPhone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                      className="input-field"
                    />
                    {errors.reporterPhone && <p className="text-danger text-sm mt-1">{errors.reporterPhone}</p>}
                  </label>
                </>
              )}

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-text-secondary text-sm">
                  <span className="text-primary font-semibold">Privacy Note:</span> Your information will be kept confidential and shared only with
                  CDSCO authorities for verification purposes.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < 3 ? (
          <button type="button" onClick={handleNextStep} className="btn-primary">
            Next Step
          </button>
        ) : (
          <button type="submit" disabled={loading} className="btn-danger disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        )}
      </div>
    </form>
  );
};

export default ReportForm;
