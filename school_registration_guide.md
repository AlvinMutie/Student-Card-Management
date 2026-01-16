# School Registration Guide

This guide explains how to register a new school to use the Student Card Management System. The system is designed to be multi-tenant, allowing each school to have its own branding (name, logo, motto) and settings.

## 1. Database Initialization
To register a new school, you need to add an entry to the `school_settings` table. This can be done via a SQL script.

```sql
INSERT INTO school_settings (
    school_name, 
    school_motto, 
    school_logo_url, 
    contact_phone_1, 
    contact_phone_2
) VALUES (
    'ST. MARY''S ACADEMY',
    'Excellence in Education',
    '/assets/logo.png',
    '0738 934 812',
    '0713 715 956'
);
```

## 2. Admin Account Creation
Every school requires at least one admin account to manage students, staff, and settings.
1. Use the registration page to create a user.
2. Manually (or via script) set the `role` to `admin` and `status` to `approved` in the `users` table.

## 3. Dynamic Branding
The ID card generator automatically pulls settings from the `school_settings` table. 
- **School Name**: Displayed in the header of the ID card.
- **Motto**: Displayed below the school name.
- **Logo**: The circular crest on the top right.
- **Contact Info**: Displayed in the footer.

## 4. Registering additional schools
Currently, the system assumes a single school per deployment. To support multiple distinct schools on the same server, we would need to add a `school_id` column to all tables (students, users, staff, etc.) and filter queries accordingly.

> [!TIP]
> You can update school settings at any time using the `adminAPI.updateSchoolSettings` function or by updating the database directly.
