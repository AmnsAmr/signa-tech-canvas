# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/70e6b9ba-9df7-4094-afca-84f22a0f6a30

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/70e6b9ba-9df7-4094-afca-84f22a0f6a30) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

Requirements:
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- MongoDB - [download here](https://www.mongodb.com/try/download/community)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i
cd server && npm i

# Step 4: Set up MongoDB (make sure MongoDB is running)
# The system will automatically create sample menu data

# Step 5: Start all services
start-with-mongodb.bat  # Windows
# OR manually start each service:
# Terminal 1: cd python-vector-service && python app.py
# Terminal 2: cd server && npm start  
# Terminal 3: npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- Node.js/Express
- MongoDB Database (flexible schema)
- SQLite Database (legacy support)
- Python Vector Analysis Microservice

## Vector File Analysis

This application includes a Python microservice for accurate vector file analysis:

- **Supported Formats**: SVG, DXF, PDF, EPS
- **Analysis Features**: Canvas dimensions, shape areas, path lengths
- **Libraries Used**: PyMuPDF, ezdxf, shapely, svgpathtools

### Running the Full Application

To run both the Node.js backend and Python microservice:

```bash
# Option 1: Use the MongoDB startup script (Recommended)
start-with-mongodb.bat

# Option 2: Use the updated startup script (Windows)
start-services-updated.bat

# Option 3: Use the original startup script
start-services.bat

# Option 4: Manual startup
# Terminal 1 - Python Service (Port 5001)
cd python-vector-service
pip install -r requirements.txt
python app.py

# Terminal 2 - Node.js Server (Port 3001)
cd server
npm install
npm start

# Terminal 3 - Frontend (Port 8080)
npm run dev
```

The Python service runs on port 5001, Node.js on port 3001, and the frontend on port 8080.

## Flexible Mega Menu System

This application now features a dynamic mega menu system with:

- **MongoDB Backend**: Flexible schema for categories and products
- **Rich Content**: Images, descriptions, and custom fields
- **Hierarchical Structure**: Unlimited nesting levels
- **Admin Interface**: Full CRUD operations with drag-and-drop
- **Responsive Design**: Desktop mega menu and mobile accordion
- **Type System**: Distinguish between categories and products

## How can I deploy this project?

**For Lovable deployment:**
Simply open [Lovable](https://lovable.dev/projects/70e6b9ba-9df7-4094-afca-84f22a0f6a30) and click on Share -> Publish.

**For production deployment:**
You'll need to deploy both services:
1. Deploy the Python microservice (port 5001)
2. Deploy the Node.js backend (port 3001) with MongoDB
3. Deploy the React frontend
4. Set the `PYTHON_VECTOR_SERVICE_URL` and `MONGODB_URI` environment variables

### Admin Panel Features

Access the mega menu manager at: **Admin Panel > Menu Management**

- Create/Edit categories and products
- Upload images for visual appeal
- Add descriptions and custom fields
- Drag-and-drop reordering
- Hierarchical view with subcategories
- Real-time preview

### Database Migration

The system automatically migrates from SQLite to MongoDB.

#### MongoDB Setup

1. **Install MongoDB**: Download from https://www.mongodb.com/try/download/community
2. **Configure Environment**: Update `server/.env`:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=signatech
   ```
3. **Start Services**: Use `start-with-mongodb.bat` or start manually

#### Enhanced Menu Features

- **Flexible Schema**: Dynamic custom fields for categories and products
- **Rich Content**: Image support, descriptions, and custom attributes
- **API Endpoints**: Full CRUD operations for menu management
- **Admin Interface**: Drag-and-drop reordering and hierarchical management

## Admin Panel Guide

### Image Management

The admin panel includes intelligent image management with business rules:

- **Logo Images**: Maximum 1 image (auto-replaces existing)
- **Hero Images**: Maximum 3 images for homepage
- **About Images**: Maximum 1 image for about page
- **Portfolio Images**: Unlimited for project galleries

### Project Management

- **Project Sections**: Organize projects into categories
- **Projects**: Title, description, and image assignment
- **Reordering**: Drag-and-drop functionality
- **Image Integration**: Link with portfolio images

### Menu Management

Access at **Admin Panel > Menu Management**:
- Create/edit categories and products
- Upload images and add descriptions
- Set custom fields and hierarchical structure
- Real-time preview and drag-and-drop reordering

## Troubleshooting

### MongoDB Issues
- Ensure MongoDB service is running
- Check connection string in `.env` file
- Verify database permissions

### Image Upload Issues
- Check uploads folder permissions
- Verify file size limits
- Ensure category rules compliance

### Vector Analysis Issues
- Ensure Python service is running on port 5001
- Check Python dependencies installation
- Verify file format support (SVG, DXF, PDF, EPS)

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
