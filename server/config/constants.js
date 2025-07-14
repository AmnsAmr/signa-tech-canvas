module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  PORT: process.env.PORT || 5000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  UPLOAD_LIMITS: {
    FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  RESET_CODE_EXPIRY: 15 * 60 * 1000 // 15 minutes
};