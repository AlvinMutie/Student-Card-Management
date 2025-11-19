# Student Card Management API

Backend API for Student Card Management System built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

**For the easiest setup, see:** `../SIMPLE_BACKEND_SETUP.md`

**Or use the automated scripts:**
- **Linux/Kali**: Run `bash quick-setup-linux.sh`
- **Windows**: Double-click `quick-setup-windows.bat`

---

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a PostgreSQL database:
```bash
createdb student_card_management
```

Or using psql:
```sql
CREATE DATABASE student_card_management;
```

2. Run the schema migration:
```bash
psql -d student_card_management -f migrations/schema.sql
```

3. (Optional) Seed sample data:
```bash
psql -d student_card_management -f migrations/seed.sql
```

**Note**: For the seed data to work, you need to generate proper bcrypt hashes. Use this script:

```javascript
// generate-hash.js
const bcrypt = require('bcrypt');
async function generateHash() {
  const hash1 = await bcrypt.hash('admin123', 10);
  const hash2 = await bcrypt.hash('parent123', 10);
  console.log('Admin hash:', hash1);
  console.log('Parent hash:', hash2);
}
generateHash();
```

Then update `migrations/seed.sql` with the generated hashes.

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_card_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (admin/parent/staff)
- `GET /api/auth/me` - Get current user info

### Students
- `GET /api/students` - Get all students (admin only)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/parent/my-students` - Get parent's children
- `POST /api/students` - Create student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `DELETE /api/students/:id` - Delete student (admin only)

### Parents
- `GET /api/parents` - Get all parents (admin only)
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create parent
- `PUT /api/parents/:id` - Update parent (admin only)
- `DELETE /api/parents/:id` - Delete parent (admin only)

### Staff
- `GET /api/staff` - Get all staff (admin only)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff (admin only)
- `DELETE /api/staff/:id` - Delete staff (admin only)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Default Credentials (from seed data)

- **Admin**: 
  - Email: `admin@example.com`
  - Password: `admin123`

- **Parent**: 
  - Email: `parent@example.com`
  - Password: `parent123`

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

Example login request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Set up database backups
6. Use a process manager like PM2

