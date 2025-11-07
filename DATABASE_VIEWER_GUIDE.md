# Database Viewer Guide

## Recommended Tools for Viewing PostgreSQL Database

### Option 1: pgAdmin 4 (Recommended for Beginners) ⭐

**Best for**: Visual interface, easy to use, full-featured

**Installation**:
- **Linux (Kali/Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install pgadmin4
  ```
- **Windows**: Download from https://www.pgadmin.org/download/
- **macOS**: `brew install --cask pgadmin4`

**Usage**:
1. Open pgAdmin 4
2. Right-click "Servers" → "Create" → "Server"
3. Enter connection details:
   - Name: `Student Card Management`
   - Host: `localhost`
   - Port: `5432`
   - Database: `student_card_management`
   - Username: `postgres` (or your DB user)
   - Password: Your PostgreSQL password
4. Click "Save"
5. Navigate to: `Servers` → `Student Card Management` → `Databases` → `student_card_management` → `Schemas` → `public` → `Tables`

**Features**:
- ✅ Visual table browser
- ✅ Query tool (SQL editor)
- ✅ Data viewer/editor
- ✅ Table structure viewer
- ✅ Export/import data
- ✅ Free and open-source

---

### Option 2: DBeaver (Universal Database Tool) ⭐⭐

**Best for**: Works with multiple databases, powerful features

**Installation**:
- **Linux**:
  ```bash
  # Download from https://dbeaver.io/download/
  # Or use snap
  sudo snap install dbeaver-ce
  ```
- **Windows/macOS**: Download from https://dbeaver.io/download/

**Usage**:
1. Open DBeaver
2. Click "New Database Connection"
3. Select "PostgreSQL"
4. Enter connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `student_card_management`
   - Username: `postgres`
   - Password: Your password
5. Click "Test Connection" then "Finish"
6. Browse tables in the left panel

**Features**:
- ✅ Works with PostgreSQL, MySQL, SQLite, etc.
- ✅ Visual query builder
- ✅ Data export/import (CSV, Excel, JSON)
- ✅ ER diagrams
- ✅ Free community edition
- ✅ Cross-platform

---

### Option 3: Command Line (psql) - Built-in

**Best for**: Quick queries, scripting, server environments

**Usage**:
```bash
# Connect to database
psql -U postgres -d student_card_management

# Or with password prompt
psql -h localhost -U postgres -d student_card_management
```

**Common Commands**:
```sql
-- List all tables
\dt

-- Describe a table structure
\d students

-- View all data from a table
SELECT * FROM students;

-- View specific columns
SELECT id, name, adm, class FROM students LIMIT 10;

-- Count records
SELECT COUNT(*) FROM students;

-- Exit
\q
```

**Features**:
- ✅ Already installed with PostgreSQL
- ✅ Fast and lightweight
- ✅ Great for quick queries
- ❌ No visual interface

---

### Option 4: VS Code Extension (PostgreSQL)

**Best for**: If you already use VS Code

**Installation**:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PostgreSQL" by Chris Kolkman
4. Install the extension

**Usage**:
1. Click the PostgreSQL icon in the sidebar
2. Click "+" to add connection
3. Enter connection details
4. Browse tables and run queries

**Features**:
- ✅ Integrated with your code editor
- ✅ SQL syntax highlighting
- ✅ Query results in editor
- ✅ Free

---

### Option 5: TablePlus (macOS/Windows/Linux)

**Best for**: Beautiful, modern interface

**Installation**:
- Download from https://tableplus.com/
- Free version available (limited connections)

**Features**:
- ✅ Beautiful, modern UI
- ✅ Fast and lightweight
- ✅ Multiple database support
- ✅ Free tier available

---

## Quick Start: View Your Database

### Using pgAdmin (Easiest):

1. **Install pgAdmin**:
   ```bash
   sudo apt install pgadmin4
   ```

2. **Start pgAdmin**:
   ```bash
   pgadmin4
   ```

3. **Add Server**:
   - Name: `Local PostgreSQL`
   - Host: `localhost`
   - Port: `5432`
   - Database: `student_card_management`
   - Username: `postgres`
   - Password: (your PostgreSQL password)

4. **View Tables**:
   - Navigate: `Servers` → `Local PostgreSQL` → `Databases` → `student_card_management` → `Schemas` → `public` → `Tables`
   - Right-click any table → "View/Edit Data" → "All Rows"

### Using Command Line (Quick):

```bash
# Connect
psql -U postgres -d student_card_management

# View students
SELECT * FROM students;

# View parents
SELECT * FROM parents;

# View staff
SELECT * FROM staff;

# View fees
SELECT * FROM fees;
```

---

## Recommended for Your Project

**For Beginners**: **pgAdmin 4** - Easiest to use, visual interface

**For Power Users**: **DBeaver** - More features, works with multiple databases

**For Quick Queries**: **psql** command line - Fast, always available

---

## Connection Details (Default)

```
Host: localhost
Port: 5432
Database: student_card_management
Username: postgres
Password: (check your .env file in backend/)
```

---

## Troubleshooting

**Can't connect?**
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Check your `.env` file in `backend/` for correct credentials
- Verify database exists: `psql -U postgres -l` (lists all databases)

**Permission denied?**
- Make sure you're using the correct username/password
- Check PostgreSQL authentication settings in `/etc/postgresql/*/main/pg_hba.conf`

**Port already in use?**
- Check if another PostgreSQL instance is running
- Verify port 5432 is available: `sudo netstat -tulpn | grep 5432`

