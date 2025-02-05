import React, { useState, useEffect } from 'react';

const AcademicInfoForm = ({ formData, onChange, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let fieldError = '';

    switch (name) {
      case 'class':
        if (!value) {
          fieldError = 'Class is required';
        }
        break;

      case 'admissionDate':
        if (!value) {
          fieldError = 'Admission date is required';
        } else {
          const admissionDate = new Date(value);
          const today = new Date();
          if (admissionDate > today) {
            fieldError = 'Admission date cannot be in the future';
          }
        }
        break;

      case 'subjects':
        if (!value || value.length < 6) {
          fieldError = 'At least 6 subjects must be selected';
        }
        break;

      case 'previousSchool':
        if (value && value.length < 3) {
          fieldError = 'Previous school name must be at least 3 characters';
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

  useEffect(() => {
    // Check overall form validity
    const hasErrors = Object.values(errors).some(error => error !== '');
    const requiredFieldsFilled = formData.class && formData.admissionDate && 
      (formData.subjects?.length >= 6);
    
    onValidationChange(!hasErrors && requiredFieldsFilled);
  }, [formData, errors]);

  return (
    <div className="space-y-6">
      {/* Current Academic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class*
            </label>
            <select
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
              onBlur={() => handleBlur('class')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${errors.class ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select class</option>
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
            </select>
            {errors.class && touched.class && (
              <p className="mt-1 text-sm text-red-600">{errors.class}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Date*
            </label>
            <input
              type="date"
              value={formData.admissionDate}
              onChange={(e) => handleChange('admissionDate', e.target.value)}
              onBlur={() => handleBlur('admissionDate')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${errors.admissionDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.admissionDate && touched.admissionDate && (
              <p className="mt-1 text-sm text-red-600">{errors.admissionDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous School
            </label>
            <input
              type="text"
              value={formData.previousSchool}
              onChange={(e) => handleChange('previousSchool', e.target.value)}
              onBlur={() => handleBlur('previousSchool')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${errors.previousSchool ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.previousSchool && touched.previousSchool && (
              <p className="mt-1 text-sm text-red-600">{errors.previousSchool}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Subject Selection* (Select at least 6 subjects)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            'Mathematics', 'English', 'Kiswahili', 'Biology', 'Physics', 'Chemistry',
            'History', 'Geography', 'CRE', 'Business Studies', 'Agriculture'
          ].map((subject) => (
            <label key={subject} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.subjects?.includes(subject)}
                onChange={(e) => {
                  const updatedSubjects = e.target.checked
                    ? [...(formData.subjects || []), subject]
                    : (formData.subjects || []).filter(s => s !== subject);
                  handleChange('subjects', updatedSubjects);
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{subject}</span>
            </label>
          ))}
        </div>
        {errors.subjects && touched.subjects && (
          <p className="mt-2 text-sm text-red-600">{errors.subjects}</p>
        )}
      </div>
    </div>
  );
};

export default AcademicInfoForm;