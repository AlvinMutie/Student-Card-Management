# Student Card Management System

A comprehensive student information management system for schools with role-based access for administrators, parents, and staff.

## 📁 Project Structure

```
Student-Card-Management/
│
├── web/                        # Web Frontend Application
│   ├── admin/                  # Admin Dashboard Pages
│   │   ├── admindashboard.html
│   │   ├── adminsettings.html
│   │   ├── parents.html
│   │   ├── students.html
│   │   ├── staff.html
│   │   ├── adminstyle.css
│   │   ├── shared-admin-styles.css
│   │   └── app-api.js
│   ├── parent/                 # Parent Pages
│   │   ├── parent_login_page.html
│   │   ├── parent_registration_page.html
│   │   └── student_info_page.html
│   ├── staff/                  # Staff Pages
│   │   └── staff_registration_page.html
│   ├── public/                 # Public/Landing Pages
│   │   ├── index.html
│   │   ├── landingpage.html
│   │   └── style.css
│   └── shared/                 # Shared Resources
│       ├── api-client.js
│       ├── Hechlink_logo.png
│       ├── logo.png
│       ├── background.mp4
│       └── data.js
│
├── mobile/                     # Mobile Applications
│   └── android/                # Android App (Kotlin)
│       └── (Android Studio project will be created here)
│
└── backend/                    # Backend API (Shared by Web & Mobile)
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

### Web Frontend

1. **Open the landing page:**
   - Navigate to `web/public/landingpage.html` in your browser
   - Or use a local server (VS Code Live Server, Python http.server, etc.)

2. **Access different sections:**
   - **Admin**: Go to `web/public/index.html` (admin login)
   - **Parent**: Go to `web/parent/parent_login_page.html`
   - **Staff**: Go to `web/staff/staff_registration_page.html`

### Android Mobile App

See **[ANDROID_APP_DEVELOPMENT_GUIDE.md](./ANDROID_APP_DEVELOPMENT_GUIDE.md)** for comprehensive instructions on developing the Android app using Android Studio and Kotlin.

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

### Deployment (Render + Netlify)

**📖 Full Deployment Guide**: See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for step-by-step instructions.

**⚡ Quick Reference**: See **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** for a condensed checklist.

**Summary:**
1. **Backend (Render)**: Deploy PostgreSQL database and Node.js web service
2. **Frontend (Netlify)**: Deploy static site with environment variable for API URL
3. **Configure**: Set `CORS_ORIGIN` in Render and `API_BASE_URL` in Netlify

## 📂 Folder Organization

### Web (`/web`)
Web frontend application (HTML, CSS, JavaScript).

#### Admin (`/web/admin`)
All admin dashboard pages and functionality.
- **Files**: Dashboard, settings, QR generator, management pages for students, parents, and staff
- **Dependencies**: Uses `../runtime-config.js` and `../shared/api-client.js` for API calls
- **Styles**: Uses `adminstyle.css` and `shared-admin-styles.css`
- **Scripts**: Uses `app-api.js` (API-driven logic); `app.js` kept for legacy reference

#### Parent (`/web/parent`)
Parent-facing pages for viewing student information.
- **Files**: Login, registration, student info dashboard
- **Dependencies**: Uses `../shared/api-client.js` for API calls
- **Access**: Parents can view their children's information after login

#### Staff (`/web/staff`)
Staff registration and management.
- **Files**: Staff registration page
- **Dependencies**: Uses `../shared/api-client.js` for API calls

#### Public (`/web/public`)
Public-facing pages and entry points.
- **Files**: Landing page, admin login
- **Dependencies**: Uses `../shared/` for shared resources

#### Shared (`/web/shared`)
Common resources used across all web sections.
- **API Client**: `api-client.js` - Handles all backend API calls
- **Assets**: Logo images, background video
- **Legacy**: `data.js` (deprecated, kept for reference)

### Mobile (`/mobile`)
Mobile applications directory.

#### Android (`/mobile/android`)
Android app development (Kotlin, Android Studio).
- **Status**: Ready for Android Studio project creation
- **Guide**: See `ANDROID_APP_DEVELOPMENT_GUIDE.md` for setup instructions
- **Technology**: Kotlin, MVVM architecture, Retrofit for API calls

### Backend (`/backend`)
Node.js + Express + PostgreSQL API server (shared by web and mobile).
- **API**: RESTful API endpoints for all CRUD operations
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with proper schema and migrations
- **Usage**: Used by both web frontend and mobile app

## 🔗 Navigation Flow

### Web Application

#### Admin Flow
1. `web/public/index.html` → Admin login
2. `web/admin/admindashboard.html` → Admin dashboard
3. Navigate between admin pages (students, parents, staff, settings)

#### Parent Flow
1. `web/public/landingpage.html` → Landing page
2. `web/parent/parent_login_page.html` → Parent login
3. `web/parent/student_info_page.html` → Parent dashboard (student info)

#### Staff Flow
1. `web/public/landingpage.html` → Landing page
2. `web/staff/staff_registration_page.html` → Staff registration

### Mobile Application
See `ANDROID_APP_DEVELOPMENT_GUIDE.md` for mobile app navigation flows and implementation details.

## 📝 Path Conventions

### Web Application Paths

#### Relative Paths
- **Within same folder**: Use `filename.html` or `./filename.html`
- **To shared resources**: Use `../shared/resource.js`
- **To other sections**: Use `../section/file.html`

#### Examples
```html
<!-- From web/admin/admindashboard.html to shared logo -->
<img src="../shared/Hechlink_logo.png">

<!-- From web/admin/admindashboard.html to another admin page -->
<a href="students.html">

<!-- From web/parent/student_info_page.html to shared API client -->
<script src="../shared/api-client.js"></script>

<!-- From web/public/landingpage.html to parent login -->
<a href="../parent/parent_login_page.html">
```

### Mobile Application
See `ANDROID_APP_DEVELOPMENT_GUIDE.md` for Android project structure and path conventions.

## 🔧 Development

### Web Frontend Development

#### Adding New Pages

1. **Admin pages**: Add to `web/admin/` folder
2. **Parent pages**: Add to `web/parent/` folder
3. **Staff pages**: Add to `web/staff/` folder
4. **Public pages**: Add to `web/public/` folder

#### Shared Resources

When adding new shared resources:
1. Place in `web/shared/` folder
2. Reference using `../shared/resource.js` or `../shared/resource.png`

#### API Integration

All API calls go through `web/shared/api-client.js`:
```javascript
// Example: Login
const response = await authAPI.login(email, password);

// Example: Get students
const students = await studentsAPI.getMyStudents();
```

### Mobile App Development

See `ANDROID_APP_DEVELOPMENT_GUIDE.md` for:
- Android Studio setup
- Kotlin implementation
- API integration with Retrofit
- MVVM architecture
- UI/UX guidelines
- Testing and deployment

## 📚 Documentation

- **🚀 Deployment Guide**: See `DEPLOYMENT_GUIDE.md` - Complete guide for deploying to Netlify (frontend) and Render (backend)
- **⚡ Quick Deployment Reference**: See `DEPLOYMENT_QUICK_REFERENCE.md` - Condensed deployment checklist
- **Android App Development**: See `ANDROID_APP_DEVELOPMENT_GUIDE.md` - Comprehensive guide for building the Android app
- **Backend Setup**: See `backend/README.md` or `SIMPLE_BACKEND_SETUP.md`
- **Database Guide**: See `DATABASE_VIEWER_GUIDE.md`
- **Test Data**: See `TEST_DATA_GUIDE.md`

## 🔐 Default Credentials

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Parent:**
- Email: `parent@example.com`
- Password: `parent123`

## 🛠️ Technologies

### Web Application
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

### Mobile Application
- **Language**: Kotlin
- **IDE**: Android Studio
- **Architecture**: MVVM (Model-View-ViewModel)
- **Networking**: Retrofit 2 + OkHttp
- **Authentication**: JWT Token Storage
- **Database**: Room (for local caching, optional)

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

1. Follow the folder structure conventions
2. Update paths when moving files
3. Test navigation flows after changes
4. Update this README if structure changes

