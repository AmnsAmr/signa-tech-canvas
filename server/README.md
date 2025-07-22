# SignaTech Server

## Project Structure

```
server/
├── config/           # Configuration files
├── controllers/      # API controllers
├── middleware/       # Express middleware
├── migrations/       # Database migrations
├── routes/           # API routes
├── scripts/          # Utility scripts
├── uploads/          # Uploaded files
├── utils/            # Utility functions
└── backups/          # Database backups
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values

3. Start the server:
   ```
   npm start
   ```

4. For development:
   ```
   npm run dev
   ```

## Database Management

The server uses SQLite for data storage. Database migrations run automatically on server startup.

### Database Commands

- Run all migrations:
  ```
  npm run db:manage migrate
  ```

- Create a database backup:
  ```
  npm run db:backup
  ```

- Run database health checks:
  ```
  npm run db:manage health
  ```

- Initialize database:
  ```
  npm run db:manage init
  ```

## Testing

- Test email functionality:
  ```
  npm run test:email
  ```

- Test vector file analysis:
  ```
  npm run test:vector path/to/vector/file.svg
  ```

## Vector File Analysis

The server supports analyzing vector files (SVG, DXF, AI, PDF, EPS, GCODE) to extract geometric information:

- Path lengths
- Shape areas
- Paper dimensions

This information is stored in the database and included in notification emails.

## API Endpoints

### Contact

- `POST /api/contact/guest-submit` - Submit a contact form as a guest
- `POST /api/contact/submit` - Submit a contact form as a logged-in user
- `GET /api/contact/download/:filename` - Download an uploaded file (admin only)
- `GET /api/contact/vector-analysis/:submissionId` - Get vector analysis for a submission (admin only)

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Admin

- `GET /api/admin/submissions` - Get all contact submissions (admin only)
- `GET /api/admin/users` - Get all users (admin only)

## File Structure

- `app.js` - Main application entry point
- `utils/startupManager.js` - Handles all initialization tasks
- `utils/dbMigrationManager.js` - Manages database migrations
- `utils/vectorAnalyzer.js` - Analyzes vector files
- `utils/vectorService.js` - Service for vector file processing