const jwt = require('jsonwebtoken');

/**
 * Middleware that attempts to authenticate a user from the Authorization header
 * but doesn't fail the request if authentication fails
 */
function optionalAuth(req, res, next) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
        } catch (err) {
          console.error('Invalid token in Authorization header:', err);
          // Don't fail the request, just continue without user
        }
      }
    }
    
    // Check for token in query parameter
    const tokenParam = req.query.token;
    if (tokenParam && !req.user) {
      try {
        const decoded = jwt.verify(tokenParam, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        console.error('Invalid token in query param:', err);
        // Don't fail the request, just continue without user
      }
    }
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}

module.exports = optionalAuth;