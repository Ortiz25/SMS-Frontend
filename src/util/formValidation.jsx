export const validateStudentForm = (formData) => {
    const errors = {};
  
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
  
    // Class validation
    if (!formData.class) {
      errors.class = 'Class is required';
    }
  
    // Stream validation
    if (!formData.stream) {
      errors.stream = 'Stream is required';
    }
  
    // Status validation
    if (!formData.status) {
      errors.status = 'Status is required';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };


  // formValidation.js

// Personal Information Validation
export const validatePersonalInfo = (data) => {
    const errors = {};
  
    // Name validation
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
  
    // Admission Number validation
    if (!data.admissionNo?.trim()) {
      errors.admissionNo = 'Admission number is required';
    } else if (!/^[A-Z]{3}\d{7}$/i.test(data.admissionNo)) {
      errors.admissionNo = 'Invalid admission number format';
    }
  
    // Date of Birth validation
    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 10 || age > 20) {
        errors.dateOfBirth = 'Student age must be between 10 and 20 years';
      }
    }
  
    // Gender validation
    if (!data.gender) {
      errors.gender = 'Gender is required';
    }
  
    // Email validation (optional)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
  
    // Phone validation (optional)
    if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Academic Information Validation
  export const validateAcademicInfo = (data) => {
    const errors = {};
  
    // Class validation
    if (!data.class) {
      errors.class = 'Class is required';
    }
  
    // Admission Date validation
    if (!data.admissionDate) {
      errors.admissionDate = 'Admission date is required';
    }
  
    // Subjects validation
    if (!data.subjects || data.subjects.length < 1) {
      errors.subjects = 'At least one subject must be selected';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Medical Information Validation
  export const validateMedicalInfo = (data) => {
    const errors = {};
  
    // Blood Group validation (if provided)
    if (data.bloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.bloodGroup)) {
      errors.bloodGroup = 'Invalid blood group';
    }
  
    // Medical Conditions validation (if critical conditions exist)
    if (data.conditions?.toLowerCase().includes('severe') || 
        data.conditions?.toLowerCase().includes('critical')) {
      errors.conditions = 'Please ensure medical documentation is provided for severe conditions';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };