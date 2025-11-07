# Student Card Management System

A comprehensive student information management system for schools with role-based access for administrators, parents, and staff.

## 📁 Project Structure

```
Student-Card-Management/
│
├── admin/                      # Admin Dashboard Pages
│   ├── admindashboard.html     # Main admin dashboard
│   ├── adminsettings.html      # Admin settings page
│   ├── parents.html            # Parents management
│   ├── students.html           # Students management
│   ├── staff.html              # Staff management
│   ├── adminstyle.css          # Admin-specific styles
│   └── app.js                  # Admin JavaScript logic
│
├── parent/                     # Parent Pages
│   ├── parent_login_page.html  # Parent login
│   ├── parent_registration_page.html  # Parent registration
│   └── student_info_page.html  # Parent dashboard (student info)
│
├── staff/                      # Staff Pages
│   └── staff_registration_page.html  # Staff registration
│
├── public/                     # Public/Landing Pages
│   ├── index.html              # Admin login page
│   ├── landingpage.html        # Public landing page
│   └── style.css               # Public page styles
│
├── shared/                     # Shared Resources
│   ├── api-client.js           # API client for backend communication
│   ├── Hechlink_logo.png       # Logo image
│   ├── logo.png                # Alternative logo
│   ├── background.mp4          # Background video
│   └── data.js                 # (Deprecated) Legacy data file
│
└── backend/                    # Backend API
    ├── server.js               # Express server
    ├── config/                 # Configuration files
    │   └── database.js         # PostgreSQL connection
    ├── routes/                 # API routes
    │   ├── auth.js             # Authentication endpoints
    │   ├── students.js         # Student endpoints
    │   ├── parents.js          # Parent endpoints
    │   └── staff.js            # Staff endpoints
    ├── middleware/             # Middleware
    │   └── auth.js             # JWT authentication
    ├── migrations/             # Database migrations
    │   ├── schema.sql          # Database schema
    │   ├── seed.sql            # Sample data
    │   └── generate-hash.js    # Password hash generator
    └── package.json            # Node.js dependencies
```

## 🚀 Quick Start

### Frontend

1. **Open the landing page:**
   - Navigate to `public/landingpage.html` in your browser
   - Or use a local server (VS Code Live Server, Python http.server, etc.)

2. **Access different sections:**
   - **Admin**: Go to `public/index.html` (admin login)
   - **Parent**: Go to `parent/parent_login_page.html`
   - **Staff**: Go to `staff/staff_registration_page.html`

### Backend

See `BACKEND_SETUP_GUIDE.md` for detailed backend setup instructions.

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up database:
   ```bash
   createdb student_card_management
   psql -d student_card_management -f migrations/schema.sql
   ```

3. Start server:
   ```bash
   npm start
   ```

## 📂 Folder Organization

### Admin (`/admin`)
All admin dashboard pages and functionality.
- **Files**: Dashboard, settings, management pages for students, parents, and staff
- **Dependencies**: Uses `../shared/api-client.js` for API calls
- **Styles**: Uses `adminstyle.css` (local)
- **Scripts**: Uses `app.js` (local) for admin logic

### Parent (`/parent`)
Parent-facing pages for viewing student information.
- **Files**: Login, registration, student info dashboard
- **Dependencies**: Uses `../shared/api-client.js` for API calls
- **Access**: Parents can view their children's information after login

### Staff (`/staff`)
Staff registration and management.
- **Files**: Staff registration page
- **Dependencies**: Uses `../shared/api-client.js` for API calls

### Public (`/public`)
Public-facing pages and entry points.
- **Files**: Landing page, admin login
- **Dependencies**: Uses `../shared/` for shared resources

### Shared (`/shared`)
Common resources used across all sections.
- **API Client**: `api-client.js` - Handles all backend API calls
- **Assets**: Logo images, background video
- **Legacy**: `data.js` (deprecated, kept for reference)

### Backend (`/backend`)
Node.js + Express + PostgreSQL API server.
- **API**: RESTful API endpoints for all CRUD operations
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with proper schema and migrations

## 🔗 Navigation Flow

### Admin Flow
1. `public/index.html` → Admin login
2. `admin/admindashboard.html` → Admin dashboard
3. Navigate between admin pages (students, parents, staff, settings)

### Parent Flow
1. `public/landingpage.html` → Landing page
2. `parent/parent_login_page.html` → Parent login
3. `parent/student_info_page.html` → Parent dashboard (student info)

### Staff Flow
1. `public/landingpage.html` → Landing page
2. `staff/staff_registration_page.html` → Staff registration

## 📝 Path Conventions

### Relative Paths
- **Within same folder**: Use `filename.html` or `./filename.html`
- **To shared resources**: Use `../shared/resource.js`
- **To other sections**: Use `../section/file.html`

### Examples
```html
<!-- From admin/admindashboard.html to shared logo -->
<img src="../shared/Hechlink_logo.png">

<!-- From admin/admindashboard.html to another admin page -->
<a href="students.html">

<!-- From parent/student_info_page.html to shared API client -->
<script src="../shared/api-client.js"></script>

<!-- From public/landingpage.html to parent login -->
<a href="../parent/parent_login_page.html">
```

## 🔧 Development

### Adding New Pages

1. **Admin pages**: Add to `admin/` folder
2. **Parent pages**: Add to `parent/` folder
3. **Staff pages**: Add to `staff/` folder
4. **Public pages**: Add to `public/` folder

### Shared Resources

When adding new shared resources:
1. Place in `shared/` folder
2. Reference using `../shared/resource.js` or `../shared/resource.png`

### API Integration

All API calls go through `shared/api-client.js`:
```javascript
// Example: Login
const response = await authAPI.login(email, password);

// Example: Get students
const students = await studentsAPI.getMyStudents();
```

## 📚 Documentation

- **Backend Setup**: See `BACKEND_SETUP_GUIDE.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`
- **Issues Fixed**: See `FIXES_APPLIED.md`
- **Backend Suggestions**: See `NAVIGATION_AND_BACKEND_SUGGESTIONS.md`

## 🔐 Default Credentials

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Parent:**
- Email: `parent@example.com`
- Password: `parent123`

## 🛠️ Technologies

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

1. Follow the folder structure conventions
2. Update paths when moving files
3. Test navigation flows after changes
4. Update this README if structure changes

