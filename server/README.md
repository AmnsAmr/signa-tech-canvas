# Signa-Tech Canvas Server

This is the backend server for the Signa-Tech Canvas application.

## Database Structure

The application uses SQLite for data storage with the following tables:

- **users**: Stores user accounts and authentication information
- **contact_submissions**: Stores contact form submissions from users and guests
- **password_resets**: Manages password reset requests
- **site_images**: Stores information about uploaded images
- **ratings**: Stores customer ratings and testimonials

## Database Maintenance

Several scripts are available for database management:

- `npm run db:init` - Initialize the database and create tables
- `npm run db:backup` - Create a backup of the database and perform maintenance
- `npm run db:health` - Check the health of the database

## API Endpoints

The server provides the following API endpoints:

- `/api/auth` - Authentication routes (login, register, etc.)
- `/api/contact` - Contact form submission routes
- `/api/admin` - Admin-only routes
- `/api/images` - Image management routes
- `/api/ratings` - Rating and testimonial routes
- `/api/user` - User profile management routes

## Development

To start the development server:

```bash
npm run dev
```

The server will run on the port specified in the `.env` file (default: 3000).

## Production

To start the production server:

```bash
npm start
```

Make sure to set the `NODE_ENV` environment variable to `production` in your `.env` file.