# Database Seed Files

## Quick Start - Reset Database with Clean Data

To delete all existing data and load fresh test data:

```bash
cd backend
./migrations/reset-database.sh
```

Or manually:

```bash
cd backend
node migrations/generate-fresh-hashes.js
psql -d student_card_management -f migrations/clean-seed.sql
```

## Seed Files

### 1. `clean-seed.sql` ⭐ **RECOMMENDED**
- **Purpose:** Delete all existing data and create fresh test data
- **Usage:** Use this when you want to start with a clean database
- **What it does:**
  - Truncates all tables (students, parents, staff, users)
  - Creates 1 admin, 10 parents, 15 students, 5 staff
  - Uses fresh password hashes

### 2. `comprehensive-seed.sql`
- **Purpose:** Add more test data without deleting existing
- **Usage:** Use this to add more test data on top of existing data
- **What it does:**
  - Creates 15 parents, 20 students, 5 staff
  - Uses ON CONFLICT to avoid duplicates

### 3. `seed.sql`
- **Purpose:** Minimal test data for quick setup
- **Usage:** Use this for basic testing
- **What it does:**
  - Creates 1 admin, 1 parent, 2 students

## Test Accounts

After running `clean-seed.sql`:

### Admin
- **Email:** `admin@hechlink.edu`
- **Password:** `admin123`

### Parents (Password: `parent123`)
- `sarah.onyango@example.com` - Has 2 students (Emma, James)
- `john.mwangi@example.com` - Has 1 student (Sophia)
- `mary.kipchoge@example.com` - Has 2 students (Michael, Olivia)
- `peter.njoroge@example.com` - Has 1 student (William)
- `jane.wanjiku@example.com` - Has 2 students (Ava, Alexander)
- `david.kamau@example.com` - Has 1 student (Isabella)
- `grace.achieng@example.com` - Has 2 students (Daniel, Mia)
- `robert.ochieng@example.com` - Has 1 student (Matthew)
- `linda.waweru@example.com` - Has 2 students (Charlotte, Joseph)
- `thomas.kariuki@example.com` - Has 1 student (Amelia)

### Staff (Password: `staff123`)
- `staff1@hechlink.edu` - Teacher (John Mwangi)
- `staff2@hechlink.edu` - Administrator (Mary Wanjiku)
- `staff3@hechlink.edu` - Librarian (Peter Kamau)
- `staff4@hechlink.edu` - Nurse (Jane Njeri)
- `staff5@hechlink.edu` - Security (Robert Kariuki)

## Generating Fresh Password Hashes

If you need to generate new password hashes:

```bash
cd backend
node migrations/generate-fresh-hashes.js
```

This will generate fresh bcrypt hashes for:
- `admin123` (admin password)
- `parent123` (parent password)
- `staff123` (staff password)

Copy the generated hashes to the seed files.

## Troubleshooting

### Accounts not working?

1. **Regenerate hashes and reload:**
   ```bash
   cd backend
   node migrations/generate-fresh-hashes.js
   psql -d student_card_management -f migrations/clean-seed.sql
   ```

2. **Verify data was loaded:**
   ```bash
   psql -d student_card_management -c "SELECT email, role FROM users;"
   ```

3. **Check password hashes:**
   ```bash
   psql -d student_card_management -c "SELECT email, role FROM users WHERE email = 'admin@hechlink.edu';"
   ```

4. **Verify backend is running:**
   ```bash
   cd backend
   npm start
   ```

## Data Structure

### Parent-Student Relationships
- Each parent has 1-2 students
- Students share the same last name as their parent
- Realistic family relationships
- Consistent across all user views

### Student Data
- Admission Numbers: ST3501 - ST3515
- NEMIS Numbers: Sequential
- Classes: Grades 1-8 with sections
- Fee Balances: KES 7,000 - 18,000

### Staff Data
- Staff Numbers: STF0001 - STF0005
- All approved for testing
- Different departments

