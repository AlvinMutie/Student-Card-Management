# Test Data Guide

This document describes the realistic test data structure used in the Student Card Management System.

## Overview

The test data is designed to be consistent and realistic, with proper parent-student relationships where:
- Each parent has **1-2 students** (not random)
- Students share the **same last name** as their parent (realistic family relationships)
- Data is consistent across admin, parent, and staff views
- All test accounts use simple passwords for easy testing

## Test Accounts

### Admin Account
- **Email:** `admin@hechlink.edu`
- **Password:** `admin123`
- **Role:** Admin

### Parent Accounts
All parent accounts use the password: `parent123`

**Sample Parent Accounts:**
1. **Sarah Onyango** (`sarah.onyango@example.com`)
   - Students: Emma Onyango (Grade 5), James Onyango (Grade 3)
   
2. **John Mwangi** (`john.mwangi@example.com`)
   - Student: Sophia Mwangi (Grade 7)
   
3. **Mary Kipchoge** (`mary.kipchoge@example.com`)
   - Students: Michael Kipchoge (Grade 4), Olivia Kipchoge (Grade 2)

... and 12 more parents with similar structure.

**Total:** 15 parents with 23 students (mix of 1-2 students per parent)

### Staff Accounts
All staff accounts use the password: `parent123`

1. **John Mwangi** (`staff1@hechlink.edu`) - Teacher
2. **Mary Wanjiku** (`staff2@hechlink.edu`) - Administrator
3. **Peter Kamau** (`staff3@hechlink.edu`) - Librarian
4. **Jane Njeri** (`staff4@hechlink.edu`) - Nurse
5. **Robert Kariuki** (`staff5@hechlink.edu`) - Security

## Data Structure

### Parent-Student Relationships
- **Family Names:** Each family shares the same last name
- **Student Distribution:** 
  - 10 parents have 1 student each
  - 5 parents have 2 students each
  - Total: 15 parents, 20 students

### Student Data
- **Admission Numbers:** ST3501 - ST3523 (sequential)
- **NEMIS Numbers:** NEMIS-7894561001 - NEMIS-7894561023 (sequential)
- **Classes:** Grades 1-8, with Red and Blue sections
- **Fee Balances:** Realistic amounts between KES 7,000 - 19,000

### Staff Data
- **Staff Numbers:** STF0001 - STF0005
- **Departments:** Teaching, Administration, Library, Health, Security
- **Status:** All approved

## Using the Test Data

### To Seed the Database:

1. **Using the comprehensive seed file:**
   ```bash
   psql -U your_user -d student_card_db -f backend/migrations/comprehensive-seed.sql
   ```

2. **Or using the realistic seed file:**
   ```bash
   psql -U your_user -d student_card_db -f backend/migrations/realistic-seed.sql
   ```

### Testing Scenarios

1. **Admin View:**
   - Login as `admin@hechlink.edu` / `admin123`
   - View all students, parents, and staff
   - See consistent family relationships

2. **Parent View:**
   - Login as any parent (e.g., `sarah.onyango@example.com` / `parent123`)
   - See only their children (1-2 students)
   - Verify family names match

3. **Staff View:**
   - Login as any staff member (e.g., `staff1@hechlink.edu` / `parent123`)
   - View student information relevant to their role

## Data Consistency

The test data ensures:
- ✅ Consistent family relationships (same last names)
- ✅ Realistic parent-student ratios (1-2 students per parent)
- ✅ Sequential admission and NEMIS numbers
- ✅ Proper foreign key relationships
- ✅ Realistic fee balances
- ✅ Consistent across all user roles

## Notes

- All passwords are hashed using bcrypt
- The seed files use `ON CONFLICT` clauses to prevent duplicate entries
- Fee balances are stored in the students table
- All staff members are pre-approved for testing
