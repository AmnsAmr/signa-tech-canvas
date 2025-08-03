const { sanitizeForLog } = require('../middleware/security');

class Logger {
  static logError(operation, error, context = {}) {
    const sanitizedContext = {};
    
    // Sanitize all context values
    for (const [key, value] of Object.entries(context)) {
      sanitizedContext[key] = sanitizeForLog(value);
    }
    
    console.error(`${operation} error:`, {
      message: error.message,
      timestamp: new Date().toISOString(),
      ...sanitizedContext
    });
  }
  
  static logInfo(operation, message, context = {}) {
    const sanitizedContext = {};
    
    // Sanitize all context values
    for (const [key, value] of Object.entries(context)) {
      sanitizedContext[key] = sanitizeForLog(value);
    }
    
    console.log(`${operation}:`, {
      message,
      timestamp: new Date().toISOString(),
      ...sanitizedContext
    });
  }
}

module.exports = Logger;