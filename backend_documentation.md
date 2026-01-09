# Student Card Management - Backend Documentation

This document provides a technical overview of the backend API for the Student Card Management system. Use this to troubleshoot errors and understand request/response structures.

## 1. Overview
- **Base URL**: `/api`
- **Tech Stack**: Node.js, Express, PostgreSQL
- **Format**: All requests and responses use `application/json`.
- **Primary Entry Point**: `backend/server.js`

---

## 2. Authentication
Most endpoints require a valid JSON Web Token (JWT).

- **Header**: `Authorization: Bearer <your_jwt_token>`
- **Token Source**: Obtained via `/api/auth/login`.
- **Roles**: `admin`, `staff`, `guard`, `parent`.

---

## 3. Core API Endpoints

### Auth (`/api/auth`)
- `POST /login`: Authenticate user. Needs `email` and `password`. Returns `token` and `user` object.
- `GET /profile`: Retrieve current user profile (requires token).
- `GET /me`: Backward compatible endpoint for user info.

### Students (`/api/students`)
- `GET /`: List all students (Admin).
- `GET /:id`: Get specific student (Admin/Parent - filtered for parents).
- `POST /`: Create student (Admin).
- `PUT /:id`: Update student by ID or Admission Number (Admin).
- `DELETE /:id`: Delete student (Admin).
- `POST /scan-qr`: Verify student QR code (Mobile App - Admin/Staff/Guard).
    - **Payload**: `{ "qrData": "ADMISSION_NO", "scannedBy": "USER_ID" }`

### Visitors (`/api/visitors`)
- `GET /`: List all visitors (Admin/Guard).
- `POST /check-in`: Register new visitor. Returns `qr_token`.
- `GET /verify/:token`: Verify visitor by QR token (Admin/Guard).
- `PUT /check-out/:id`: Mark visitor as checked out.
- `DELETE /:id`: Remove visitor record (Admin).

### Staff (`/api/staff`)
- `GET /`: List all non-admin staff (Admin).
- `POST /register`: Public registration (Unauthenticated - sets status to `pending`).
- `POST /`: Create/Upsert staff record (Admin).
- `PUT /:id`: Update staff details (Admin).
- `DELETE /:id`: Delete staff/user record (Admin).

### Admin Tools (`/api/admin`)
- `PUT /approve-staff/:id`: Change user status to `approved`.
- `PUT /disable-staff/:id`: Change user status to `disabled`.
- `GET /pending-staff`: List users awaiting approval.

### Payments (`/api/payments`)
- `GET /categories`: List fee categories (priorities and caps).
- `GET /allocations/:parentId`: View payment breakdown for a parent.
- `POST /submit`: Process payment and auto-allocate to categories.

---

## 4. Common Error Codes & Responses
Errors typically follow this shape:
```json
{
  "error": "Error message description",
  "details": "Optional low-level info (dev mode)"
}
```

- **400 Bad Request**: Missing required fields or validation failure (e.g., "Admission number required").
- **401 Unauthorized**: Missing or invalid token.
- **403 Forbidden**: Insufficient permissions (e.g., staff trying to access admin-only student list) or account status (e.g., "Account awaiting admin approval").
- **404 Not Found**: Resource doesn't exist (e.g., "Student not found").
- **500 Internal Server Error**: Database connection issues or unexpected crashes.

---

## 5. Implementation Notes for AI
- **Database Connection**: Managed by `backend/config/database.js`. Uses `DATABASE_URL` env var.
- **Middleware**: `backend/middleware/auth.js` handles token verification and role checking.
- **Schema**: Auto-heals certain columns in `server.js` (e.g., if `user_id` is missing in staff/parents).
