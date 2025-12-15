# Test Credentials - Quick Reference

After loading test data, use these credentials to test different user types.

## Admin

**Email**: `admin@hechlink.edu`  
**Password**: `admin123`  
**Access**: Full admin dashboard, all features

## Parents (15 accounts)

**Password for ALL parents**: `parent123`

### Example Parent Accounts:

1. **Sarah Onyango**
   - Email: `sarah.onyango@example.com`
   - Password: `parent123`
   - Students: Emma Onyango, James Onyango

2. **John Mwangi**
   - Email: `john.mwangi@example.com`
   - Password: `parent123`
   - Students: Sophia Mwangi

3. **Mary Kipchoge**
   - Email: `mary.kipchoge@example.com`
   - Password: `parent123`
   - Students: Michael Kipchoge, Olivia Kipchoge

4. **Peter Njoroge**
   - Email: `peter.njoroge@example.com`
   - Password: `parent123`
   - Students: William Njoroge

5. **Jane Wanjiku**
   - Email: `jane.wanjiku@example.com`
   - Password: `parent123`
   - Students: Ava Wanjiku, Alexander Wanjiku

**And 10 more parent accounts...**

## Staff (5 accounts)

**Password for ALL staff**: `parent123` (same as parents for testing)

1. **John Mwangi** (Teaching)
   - Email: `staff1@hechlink.edu`
   - Password: `parent123`
   - Staff No: STF0001

2. **Mary Wanjiku** (Administration)
   - Email: `staff2@hechlink.edu`
   - Password: `parent123`
   - Staff No: STF0002

3. **Peter Kamau** (Library)
   - Email: `staff3@hechlink.edu`
   - Password: `parent123`
   - Staff No: STF0003

4. **Jane Njeri** (Health)
   - Email: `staff4@hechlink.edu`
   - Password: `parent123`
   - Staff No: STF0004

5. **Robert Kariuki** (Security)
   - Email: `staff5@hechlink.edu`
   - Password: `parent123`
   - Staff No: STF0005

## Students

Students are linked to parent accounts. After logging in as a parent, you'll see their linked students.

**Example Students:**
- ST3501: Emma Onyango (linked to sarah.onyango@example.com)
- ST3502: James Onyango (linked to sarah.onyango@example.com)
- ST3503: Sophia Mwangi (linked to john.mwangi@example.com)
- And 20+ more students...

## Quick Test Scenarios

### Test Admin Dashboard
1. Login: `admin@hechlink.edu` / `admin123`
2. You'll see all students, parents, staff
3. Charts populated with data
4. Fee summaries

### Test Parent Portal
1. Login: `sarah.onyango@example.com` / `parent123`
2. You'll see 2 students (Emma and James)
3. Fee information for both
4. Student details

### Test Staff Access
1. Login: `staff1@hechlink.edu` / `parent123`
2. Access staff features

## Loading Test Data

Use the diagnostic page to load all this data:
1. Visit: `https://hechl1nk.netlify.app/public/api-test.html`
2. Click "Load Test Data"
3. Wait 30-60 seconds
4. Use credentials above to test

---

**All passwords are set for easy testing. Change them in production!**

