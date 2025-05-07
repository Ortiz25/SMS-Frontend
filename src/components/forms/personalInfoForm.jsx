import React, { useState, useEffect } from 'react';

const PersonalInfoForm = ({ formData, onChange, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  const validateField = (name, value) => {
    let fieldError = '';

    switch (name) {
      case 'name':
        if (!value?.trim()) {
          fieldError = 'Name is required';
        } else if (value.length < 3) {
          fieldError = 'Name must be at least 3 characters';
        }
        break;

      case 'admissionNo':
        if (!value?.trim()) {
          fieldError = 'Admission number is required';
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          fieldError = 'Date of birth is required';
        }
        break;

      case 'gender':
        if (!value) {
          fieldError = 'Gender is required';
        }
        break;

      case 'phone':
        if (value && !/^\+?[\d\s-]{10,}$/.test(value)) {
          fieldError = 'Invalid phone number format';
        }
        break;
    }

    return fieldError;
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const fieldError = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  // Validate form and update parent
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== '');
    const requiredFields = ['name', 'admissionNo', 'dateOfBirth', 'gender'];
    const requiredFieldsFilled = requiredFields.every(field => formData[field]?.trim());
    const formIsValid = !hasErrors && requiredFieldsFilled;
    
    setIsValid(formIsValid);
    onValidationChange(formIsValid);
  }, [formData, errors]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name*
          </label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name*
          </label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Name*
          </label>
          <input
            type="text"
            value={formData.otherNames || ''}
            onChange={(e) => handleChange('otherNames', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Admission Number Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admission Number*
          </label>
          <input
            type="text"
            value={formData.admissionNo || ''}
            onChange={(e) => handleChange('admissionNo', e.target.value)}
            onBlur={() => handleBlur('admissionNo')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.admissionNo ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.admissionNo && touched.admissionNo && (
            <p className="mt-1 text-sm text-red-600">{errors.admissionNo}</p>
          )}
        </div>

        {/* Date of Birth Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth*
          </label>
          <input
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.dateOfBirth && touched.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Gender Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender*
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            onBlur={() => handleBlur('gender')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && touched.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phone && touched.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            rows="3"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;