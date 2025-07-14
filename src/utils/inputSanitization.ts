
/**
 * Sanitize user input to prevent XSS and other injection attacks
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"&]/g, (match) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
  
  return sanitized;
};

/**
 * Validate numeric input
 */
export const validateNumericInput = (value: any, min?: number, max?: number): number | null => {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  
  return num;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate trade symbol format
 */
export const validateSymbol = (symbol: string): boolean => {
  // Allow only alphanumeric characters, hyphens, and dots
  const symbolRegex = /^[A-Za-z0-9.-]+$/;
  return symbolRegex.test(symbol) && symbol.length >= 1 && symbol.length <= 20;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate and sanitize trade notes
 */
export const validateTradeNotes = (notes: string): string => {
  if (!notes) return '';
  
  // Limit length and sanitize
  const sanitized = sanitizeInput(notes, 500);
  
  // Remove any potentially malicious patterns
  return sanitized.replace(/javascript:/gi, '')
                  .replace(/data:/gi, '')
                  .replace(/vbscript:/gi, '');
};
