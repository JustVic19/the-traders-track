/**
 * Secure logging utility that filters sensitive data in production
 */

const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'auth', 'session',
  'user_id', 'email', 'phone', 'ssn', 'credit', 'card'
];

const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      lowerKey.includes(sensitiveKey)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const secureLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data ? sanitizeObject(data) : '');
    }
  },
  
  error: (message: string, error?: any) => {
    const sanitizedError = error ? sanitizeObject(error) : '';
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, sanitizedError);
    } else {
      // In production, only log essential error info
      console.error(`[ERROR] ${message}`, error?.message || 'Unknown error');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data ? sanitizeObject(data) : '');
    }
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? sanitizeObject(data) : '');
    }
  }
};