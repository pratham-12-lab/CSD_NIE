// Validation rules and functions
export const validationRules = {
  fullname: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'.-]+$/,
    message: 'Name should contain only letters, spaces, hyphens, apostrophes (2-50 characters)'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phoneNumber: {
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
    message: 'Phone number should be exactly 10 digits'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character'
  },
  companyName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-&.,()]+$/,
    message: 'Company name should be 2-100 characters'
  },
  companyWebsite: {
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
    message: 'Please enter a valid website URL'
  }
};

// Validate individual field
export const validateField = (fieldName, value) => {
  const rule = validationRules[fieldName];
  
  if (!rule) return { isValid: true, message: '' };
  
  // Check minimum length
  if (rule.minLength && value.length < rule.minLength) {
    return { isValid: false, message: rule.message };
  }
  
  // Check maximum length
  if (rule.maxLength && value.length > rule.maxLength) {
    return { isValid: false, message: rule.message };
  }
  
  // Check pattern
  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message };
  }
  
  return { isValid: true, message: '' };
};

// Validate form data
export const validateForm = (data, fieldsToValidate) => {
  const errors = {};
  
  fieldsToValidate.forEach(fieldName => {
    if (data[fieldName]) {
      const validation = validateField(fieldName, data[fieldName]);
      if (!validation.isValid) {
        errors[fieldName] = validation.message;
      }
    } else if (fieldName !== 'companyWebsite' && fieldName !== 'file') {
      // companyWebsite and file are optional
      errors[fieldName] = 'This field is required';
    }
  });
  
  return errors;
};

// Get password strength
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  return {
    score: strength,
    label: strength < 2 ? 'Weak' : strength < 4 ? 'Fair' : 'Strong',
    color: strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-500' : 'text-green-500'
  };
};
