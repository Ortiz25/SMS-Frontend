import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { validateMedicalInfo } from '../../util/formValidation';

const MedicalInfoForm = ({ formData, onChange, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasUrgentCondition, setHasUrgentCondition] = useState(false);

  const validateField = (name, value) => {
    let fieldError = '';

    switch (name) {
      case 'bloodGroup':
        if (value && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(value)) {
          fieldError = 'Invalid blood group';
        }
        break;

      case 'conditions':
        const urgentKeywords = ['severe', 'critical', 'emergency', 'urgent'];
        const hasUrgent = urgentKeywords.some(keyword => 
          value?.toLowerCase().includes(keyword)
        );
        if (hasUrgent && !formData.medicalDocuments) {
          fieldError = 'Medical documentation is required for severe conditions';
        }
        setHasUrgentCondition(hasUrgent);
        break;

      case 'allergies':
        if (value && value.length < 3) {
          fieldError = 'Please provide more details about allergies';
        }
        break;

      case 'medications':
        if (value && !value.includes(' ')) {
          fieldError = 'Please provide complete medication details';
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
    const isValid = !hasErrors && (!hasUrgentCondition || formData.medicalDocuments);
    onValidationChange(isValid);
  }, [formData, errors, hasUrgentCondition]);

  return (
    <div className="space-y-6">
      {/* Basic Medical Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
              onBlur={() => handleBlur('bloodGroup')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select blood group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.bloodGroup && touched.bloodGroup && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Known Allergies
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              onBlur={() => handleBlur('allergies')}
              placeholder="List any allergies"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${errors.allergies ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.allergies && touched.allergies && (
              <p className="mt-1 text-sm text-red-600">{errors.allergies}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical Conditions
        </label>
        <textarea
          value={formData.conditions}
          onChange={(e) => handleChange('conditions', e.target.value)}
          onBlur={() => handleBlur('conditions')}
          placeholder="Describe any existing medical conditions"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.conditions ? 'border-red-500' : 'border-gray-300'}`}
          rows="3"
        />
        {hasUrgentCondition && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Urgent medical condition detected. Please ensure all relevant documentation is provided.
            </p>
          </div>
        )}
        {errors.conditions && touched.conditions && (
          <p className="mt-1 text-sm text-red-600">{errors.conditions}</p>
        )}
      </div>

      {/* Current Medications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Medications
        </label>
        <textarea
          value={formData.medications}
          onChange={(e) => handleChange('medications', e.target.value)}
          onBlur={() => handleBlur('medications')}
          placeholder="List any current medications with dosage"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.medications ? 'border-red-500' : 'border-gray-300'}`}
          rows="3"
        />
        {errors.medications && touched.medications && (
          <p className="mt-1 text-sm text-red-600">{errors.medications}</p>
        )}
      </div>
    </div>
  );
};

export default MedicalInfoForm;