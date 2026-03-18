# Sales CRM - React Frontend

A modern, responsive React frontend for a MERN stack Sales CRM system. Built with React, Vite, Tailwind CSS, and React Router.

## Features

### Authentication
- User login and registration
- JWT token-based authentication
- Protected routes
- Persistent login state

### Dashboard
- KPI cards showing key metrics
- Recent leads list
- Quick action buttons
- Real-time data updates

### Leads Management
- View all leads in a table
- Add new leads
- Edit existing leads
- Delete leads
- Search by name, email, or company
- Filter by status
- Detailed lead view with related deals

### Deals Pipeline
- Kanban-style board with 4 stages
- Create, edit, delete deals
- View deals grouped by stage
- Track deal values

### Activities Tracking
- Log activities (calls, emails, meetings, tasks)
- View activity history
- Filter by type
- Track related leads/deals

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Layout components (Sidebar, Navbar, Layout)
│   │   ├── Button.jsx      # Button component
│   │   ├── Card.jsx        # Card component
│   │   ├── Modal.jsx       # Modal component
│   │   ├── Input.jsx       # Input component
│   │   ├── Select.jsx      # Select component
│   │   ├── Table.jsx       # Table component
│   │   ├── Loading.jsx     # Loading spinner
│   │   └── Alert.jsx       # Alert component
│   ├── context/            # React Context
│   │   └── AuthContext.jsx # Auth context provider
│   ├── pages/              # Page components
│   │   ├── auth/           # Auth pages
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── leads/          # Lead pages
│   │   │   ├── Leads.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   └── LeadModal.jsx
│   │   ├── deals/          # Deal pages
│   │   │   ├── Deals.jsx
│   │   │   └── DealModal.jsx
│   │   ├── activities/     # Activity pages
│   │   │   ├── Activities.jsx
│   │   │   └── ActivityModal.jsx
│   │   └── Dashboard.jsx
│   ├── utils/              # Utility functions
│   │   └── api.js          # API configuration and endpoints
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/
├── .env.example            # Environment variables example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `VITE_API_URL` in `.env` to match your backend server:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit `http://localhost:5173`

## API Integration

The frontend connects to the backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Deals
- `GET /api/deals` - Get all deals
- `GET /api/deals/:id` - Get deal by ID
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity

## Design Features

The UI follows a modern SaaS design pattern with:

- **Left Sidebar Navigation** - Fixed sidebar with icon navigation
- **Top Navigation Bar** - Search bar and user profile
- **KPI Cards** - Clean metrics display
- **Soft Colors** - Primary blue (#0ea5e9) with accent colors
- **Rounded Corners** - Cards and buttons with rounded-xl
- **Subtle Shadows** - Clean shadow-md on cards
- **Responsive Layout** - Mobile-friendly design
- **Custom Scrollbar** - Styled scrollbars for better UX

## Available Scripts

In the client directory, you can run:

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. API interceptor adds token to all requests
5. Protected routes check for valid user
6. Auto-redirect to login if not authenticated

## State Management

The app uses React Context for global state (authentication) and local state with useState/useEffect for component-level state. This keeps the implementation simple while maintaining good practices.

## Components Overview

### Reusable Components
- **Button** - Multiple variants (primary, secondary, danger, success)
- **Input** - Form input with validation support
- **Select** - Dropdown select component
- **Modal** - Reusable modal dialog
- **Card** - Card container with hover effects
- **Table** - Simple table component
- **Loading** - Loading spinner
- **Alert** - Alert messages (success, error, warning, info)

### Layout Components
- **Sidebar** - Fixed left navigation
- **Navbar** - Top bar with search and profile
- **Layout** - Main layout wrapper

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    500: '#0ea5e9', // Your primary color
  },
}
```

### API URL
Change the API base URL in `.env`:

```
VITE_API_URL=http://your-backend-url:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with modern React best practices, clean code principles, and a focus on user experience.

