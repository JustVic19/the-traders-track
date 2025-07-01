
import { toast } from 'sonner';

/**
 * Enhanced error handling with proper logging and user feedback
 */
export const handleError = (error: any, context: string = 'Unknown') => {
  console.error(`Error in ${context}:`, error);
  
  // Determine user-friendly message
  let userMessage = 'An unexpected error occurred';
  
  if (error?.message) {
    // Common error patterns
    if (error.message.includes('auth')) {
      userMessage = 'Authentication error. Please log in again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.message.includes('validation')) {
      userMessage = 'Invalid data provided. Please check your input.';
    } else {
      userMessage = error.message;
    }
  }
  
  toast.error(userMessage);
  
  // Log to external service in production (implement as needed)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
    console.error('Production error:', { error, context, timestamp: new Date().toISOString() });
  }
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};
