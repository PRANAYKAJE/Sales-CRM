# Sales CRM - Client Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing sales leads, deals, activities, and users.

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd Server
npm install

# Install client dependencies
cd ../Client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `Server` directory:

```env
MONGO_URI=mongodb://localhost:27017/salescrm (or MONGODB ATLAS URL)
PORT=5000
JWT_SECRET=your-secret-key-here
```

### 3. Seed the Database (Optional - creates demo data)

```bash
cd Server
npm run seed
```

### 4. Run the Application

**Terminal 1 - Start Server:**
```bash
cd Server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd Client
npm run dev
```

### 5. Access the Application

Open your browser and go to: **http://localhost:5173**

---

## Login Credentials

After running `npm run seed`, use these accounts:

| Role      | Email           | Password    |
|------     |-------          |----------   |
| **Admin** | admin@crm.com   | Admin@123   | 
| **Sales** | john@crm.com    | User@123    |
| **Sales** | sarah@crm.com   | User@123    |
| **Sales** | mike@crm.com    | User@123    |
| **Sales** | emily@crm.com   | User@123    |
| **Sales** | david@crm.com   | User@123    |
| **Sales** | jessica@crm.com | User@123    |

---

## Project Structure

```
├── Server/                 # Backend API (Express + MongoDB)
│   ├── config/           # Database configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── seeder.js         # Database seeder
│   └── server.js         # Entry point
│
├── Client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/      # Auth & Theme providers
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API utilities
│   │   └── App.jsx       # Main app & routing
│   └── ...
│
└── README.md             # This file
```

---

## Features

### Dashboard
- Overview with KPI cards (Total Leads, Deals Won, Deals Lost, Activities)
- Recent leads list
- Quick action buttons

### Leads Management
- View all leads in a table
- Create new leads
- Edit lead details
- Assign leads to sales persons
- Search and filter leads
- View lead details with associated deals and activities

### Deals Management
- Track deals through pipeline stages: Prospect → Negotiation → Won/Lost
- Deal values and status tracking
- Associate deals with leads

### Activities Tracking
- Log different activity types: Call, Meeting, Note, Follow-up
- Track interactions with leads
- Activity history per lead

### User Management (Admin Only)
- View all users
- Create new users (Admin/Sales roles)
- Edit user details
- Manage user accounts

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## API Endpoints

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register new user  |
| POST   | /api/auth/login    | User login         |
| GET    | /api/users         | Get all users      |
| GET    | /api/leads         | Get all leads      |
| POST   | /api/leads         | Create lead        |
| GET    | /api/leads/:id     | Get lead details   |
| PUT    | /api/leads/:id     | Update lead        |
| DELETE | /api/leads/:id     | Delete lead        |
| GET    | /api/deals         | Get all deals      |
| POST   | /api/deals         | Create deal        |
| PUT    | /api/deals/:id     | Update deal        |
| GET    | /api/activities    | Get all activities |
| POST   | /api/activities    | Create activity |

---

## Useful Commands

```bash
# Server commands
cd Server
npm run dev        # Start server (development)
npm run seed       # Seed database with demo data
npm run seed:d     # Destroy all seeded data
npm start          # Start server (production)

# Client commands
cd Client
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify the `MONGO_URI` in `.env` is correct

### Port Already in Use
- Server runs on port 5000 by default
- Client runs on port 5173 by default
- Change ports in `Server/server.js` or `Client/vite.config.js` if needed

### Login Not Working
- Make sure you've run `npm run seed` to create users
- Check that JWT_SECRET is set in `.env`
