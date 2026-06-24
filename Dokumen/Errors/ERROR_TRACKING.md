# ❌ ERROR TRACKING DATABASE

**Created:** 10 Februari 2026  
**Purpose:** Dokumentasi semua error yang terjadi di project (kritis dan kecil) agar tidak lupa dan tidak repeat error yang sama

---

## 📋 FORMAT ERROR ENTRY

```markdown
## Error #[ID]: [Nama Error Singkat]

**Date:** [Tanggal]
**Session:** Session [X]
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Minor
**Status:** ❌ Unresolved / ⚠️ Workaround / ✅ Resolved

**Error Message:**
```
[Full error message/stack trace]
```

**Location:**
- File: [path/to/file.py atau file.jsx]
- Line: [line number jika ada]
- Function/Component: [nama function/component]
- Module: Backend/Frontend/Database/ML

**Impact:**
- Fitur affected: [nama fitur]
- Kode affected: [deskripsi kode yang error]
- User impact: [bagaimana user terdampak]
- Blocking: Yes/No [apakah block development]

**Root Cause:**
[Penjelasan penyebab error]

**Solution:**
[Cara fix yang berhasil]

**Prevention:**
[Cara mencegah error ini muncul lagi]

**Related Errors:**
- Error #[ID] - [related error jika ada]

---
```

---

## 🔴 CRITICAL ERRORS (Priority: HIGH)

### Error #C001: [To be filled when critical error happens]
[Will be logged when it occurs]

---

## 🟡 MEDIUM ERRORS (Priority: MEDIUM)

### Error #M001: npm create vite interactive prompt stuck

**Date:** 10 Februari 2026  
**Session:** Session 4  
**Severity:** 🟡 Medium  
**Status:** ✅ Resolved

**Error Message:**
```
◆  Use Vite 8 beta (Experimental)?:
│  ○ Yes
│  ● No
└ [Process waits indefinitely for user input]

Operation cancelled
```

**Location:**
- File: Terminal command execution
- Line: N/A
- Function/Component: npm CLI interactive prompt
- Module: Frontend - Project Setup

**Impact:**
- Fitur affected: React project initialization
- Kode affected: Entire frontend structure creation
- User impact: Cannot create React project using standard Vite CLI
- Blocking: Yes (blocked frontend setup)

**Root Cause:**
Interactive CLI prompts require manual user input and cannot be automated through tool execution. The prompt waits indefinitely for keyboard input which cannot be provided programmatically.

**Solution:**
Created entire React project structure manually:
1. Used `create_directory` tool to create all folders
2. Used `create_file` tool to create all configuration files (package.json, vite.config.js, etc)
3. Ran `npm install` after files were created manually
Result: ✅ Success - Project created perfectly, server running

**Prevention:**
- ALWAYS use manual creation approach for projects requiring interactive setup
- Avoid CLI tools with prompts in automated workflows
- Document manual setup steps in roadmap

**Related Errors:**
- None

---

### Error #M002: manage.py not found - wrong directory

**Date:** 10 Februari 2026  
**Session:** Session 4  
**Severity:** 🟡 Medium  
**Status:** ✅ Resolved

**Error Message:**
```
python.exe: can't open file 'C:\\laragon\\www\\TA\\manage.py': [Errno 2] No such file or directory
```

**Location:**
- File: manage.py (expected location)
- Line: N/A
- Function/Component: Django management command
- Module: Backend - Server startup

**Impact:**
- Fitur affected: Django development server
- Kode affected: All Django commands (migrate, runserver, createsuperuser)
- User impact: Cannot start backend server
- Blocking: Yes (blocked server testing)

**Root Cause:**
Executed `python manage.py runserver` from wrong directory (`C:\laragon\www\TA\` instead of `C:\laragon\www\TA\pos_backend\`). Django's manage.py must be run from project root where the file exists.

**Solution:**
Change directory first before running Django commands:
```powershell
cd pos_backend
python manage.py runserver
```
Result: ✅ Success - Server started at http://localhost:8000

**Prevention:**
- ALWAYS verify current working directory before running project-specific commands
- Use `cd [project_folder]` explicitly in commands
- Django commands: must be in `pos_backend/`
- npm commands: must be in `pos-frontend/`

**Related Errors:**
- Error #M003 (same pattern for npm)

---

### Error #M003: npm command not found package.json

**Date:** 10 Februari 2026  
**Session:** Session 4  
**Severity:** 🟡 Medium  
**Status:** ✅ Resolved

**Error Message:**
```
npm error code ENOENT
npm error syscall open
npm error path C:\laragon\www\TA\package.json
npm error errno -4058
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Location:**
- File: package.json (expected location)
- Line: N/A
- Function/Component: npm CLI
- Module: Frontend - Development server

**Impact:**
- Fitur affected: React development server
- Kode affected: All npm scripts (dev, build, preview)
- User impact: Cannot start frontend server
- Blocking: Yes (blocked server testing)

**Root Cause:**
Executed `npm run dev` from wrong directory (`C:\laragon\www\TA\` instead of `C:\laragon\www\TA\pos-frontend\`). npm looks for package.json in current directory.

**Solution:**
Change directory first before running npm commands:
```powershell
cd pos-frontend
npm run dev
```
Result: ✅ Success - Server started at http://localhost:5173

**Prevention:**
- ALWAYS verify current working directory before running npm commands
- Use `cd [project_folder]` explicitly in commands
- npm commands: must be in `pos-frontend/`
- Django commands: must be in `pos_backend/`

**Related Errors:**
- Error #M002 (same pattern for Django)

---

### Error #M004: Database not visible in DBCode - incorrect username

**Date:** 11 Februari 2026  
**Session:** Session 5  
**Severity:** 🟡 Medium  
**Status:** ✅ Resolved

**Error Message:**
```
ERROR while calling tool: Failed to create connection ML_POS
Please check your input and try again.
```

**Location:**
- File: DBCode extension configuration
- Line: N/A (configuration issue)
- Function/Component: DBCode PostgreSQL connection
- Module: Database - Visualization Tools

**Impact:**
- Fitur affected: Database visualization in VS Code
- Kode affected: PostgreSQL connection configuration
- User impact: Cannot view database tables/schemas visually in VS Code
- Blocking: Yes (blocks visual database management workflow)

**Root Cause:**
DBCode connection configured with incorrect username. Username was set to `PostgreSQL` (capital P) instead of `postgres` (lowercase). PostgreSQL usernames are case-sensitive and must match exactly with the database user.

**Context:**
- Database `pos_ml_db` verified to exist via psql commands
- Database accessible via `psql -U postgres -d pos_ml_db` (CLI works)
- DBCode connection showed in sidebar but couldn't expand/connect
- Error occurred when calling `dbcode-get-databases` tool

**Solution:**
1. Click Edit Connection on ML_POS connection in DBCode panel
2. Navigate to Authentication section
3. Change Username from `PostgreSQL` to `postgres` (all lowercase)
4. Save connection
5. Click Refresh icon in DBCode toolbar
6. Expand connection → Database visible with all schemas and tables

**Result:** ✅ Success
- Connection established: `ML_POS 17.2`
- Database visible: `pos_ml_db (8MB, Default)`
- Schemas accessible: 3 schemas (public, pg_catalog, information_schema)
- Tables visible: 10 Django tables in public schema

**Prevention:**
- Always use lowercase `postgres` for default Laragon PostgreSQL user
- Verify username case-sensitivity when configuring database tools
- Test connection immediately after configuration
- Document correct credentials in project documentation

**Related Errors:**
- None (unique to database tool configuration)

---

## 🟢 MINOR ERRORS (Priority: LOW)

### Error #L001: mkdir folder already exists

**Date:** 10 Februari 2026  
**Session:** Session 4  
**Severity:** 🟢 Minor  
**Status:** ✅ Resolved (Not a real error)

**Error Message:**
```
mkdir : An item with the specified name C:\laragon\www\TA\pos_backend\media\products already exists.
ResourceExists: DirectoryExist
```

**Location:**
- File: N/A (filesystem operation)
- Line: N/A
- Function/Component: PowerShell mkdir command
- Module: Backend - Asset folder creation

**Impact:**
- Fitur affected: Media folder creation
- Kode affected: Asset management system
- User impact: None (folders already exist = desired outcome)
- Blocking: No

**Root Cause:**
Tried to create same folder twice. First attempt succeeded, second attempt threw error because folder already exists. This is expected behavior, not a bug.

**Solution:**
Two approaches:
1. Use `mkdir -Force` to suppress error
2. Ignore error (folder existing is OK)
Result: ✅ No action needed - Folders were successfully created

**Prevention:**
- Use `-Force` flag in mkdir for idempotent operations
- Add conditional check before creating folders
- Ignore this error type (it's informational, not harmful)

**Related Errors:**
- None

---

## 📊 ERROR STATISTICS

**Total Errors Logged:** 5  
**By Severity:**
- 🔴 Critical: 0
- 🟡 Medium: 4
- 🟢 Minor: 1

**By Status:**
- ❌ Unresolved: 0
- ⚠️ Workaround: 0
- ✅ Resolved: 5

**By Module:**
- Backend: 1 error
- Frontend: 2 errors
- Database: 1 error
- ML: 0 errors
- Infrastructure: 1 error

**Most Common Error Type:** Configuration issues (4 errors)

---

## 🎯 ERROR PATTERNS IDENTIFIED

### Pattern #1: Wrong Working Directory
**Frequency:** 2 errors (M002, M003)  
**Root Cause:** Commands executed from parent directory instead of project directory  
**Prevention:** Always `cd` to correct folder before running project commands

### Pattern #2: Interactive CLI Tools
**Frequency:** 1 error (M001)  
**Root Cause:** Automated tool execution can't handle interactive prompts  
**Prevention:** Use manual/non-interactive approaches for project scaffolding

### Pattern #3: Case-Sensitive Configuration
**Frequency:** 1 error (M004)  
**Root Cause:** Username/credentials with incorrect case (PostgreSQL vs postgres)  
**Prevention:** Always verify exact case for usernames, especially in database connections

---

## 📚 LESSONS LEARNED

1. **Always verify working directory** before running project-specific commands
2. **Interactive CLI tools don't work** in automated workflows - use manual approach
3. **Folder exists errors are OK** - means folder was already created successfully
4. **Document solutions immediately** so we don't repeat same mistakes

---

## 🔄 MAINTENANCE

**Last Updated:** 11 Februari 2026 - Session 5  
**Next Review:** After each session  
**Owned By:** AI + Developer

**When to Update:**
- Immediately after encountering new error
- After finding solution to existing error
- When error status changes (Unresolved → Resolved)
- After identifying new error patterns

---

## 📋 QUICK ERROR ID REFERENCE

**Critical (C):**
- C001-C999: Reserved for critical errors

**Medium (M):**
- M001: npm create vite interactive prompt stuck
- M002: manage.py not found - wrong directory
- M003: npm command not found package.json
- M004: Database not visible in DBCode - incorrect username

**Minor (L):**
- L001: mkdir folder already exists

---

**Next Error ID:** C001 (Critical), M005 (Medium), L002 (Minor)
