
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
