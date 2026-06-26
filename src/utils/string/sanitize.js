

// Define your custom sanitizer function
const sanitizeInput = (value) => {
  // To Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  // Remove potential script injections
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  // Trim extra spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  return sanitized;
};


// export the function
module.exports = sanitizeInput;
