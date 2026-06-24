# 📂 PROJECT STRUCTURE REFERENCE

**Last Updated:** 10 Februari 2026  
**Quick reference untuk AI dan developers**

---

## 🗂️ FOLDER STRUCTURE

```
C:\laragon\www\TA\
│
├── 📚 Dokumen/                         # All documentation
│   ├── Errors/                        # ❌ Error tracking (separate)
│   │   ├── README.md                  # Error folder guide
│   │   └── ERROR_TRACKING.md          # Error database (kritis & kecil)
│   ├── PROJECT_NOTES_IMPORTANT.md     # ⚠️ BACA INI DULU! Critical Notes
│   ├── FLAG_COMMAND_REFERENCE.md      # FLAG system guide
│   ├── ROADMAP_DEVELOPMENT_SESSIONS.md # Session-by-session roadmap
│   ├── CHECKPOINT_SESSION_*.md        # Progress tracking per session
│   ├── FLAG_CHECKPOINT_SESSION_*.md   # Detailed checkpoints with errors
│   ├── PANDUAN_DEPLOYMENT.md          # Deployment guide
│   └── [other docs...]
│
├── 🎨 pos-ml-system_dummy/            # HTML Prototype (UI Reference)
│   ├── admin/ (12 pages)
│   ├── kasir/ (4 pages)
│   ├── login.html
│   └── assets/
│   ⚠️ NOTE: Ini DUMMY/REFERENCE saja, production pakai React (pos-frontend/)
│
├── 🐍 pos_backend/                    # Django Backend (Production)
│   ├── manage.py
│   ├── pos_backend/ (settings, urls)
│   ├── users/
│   ├── products/
│   ├── inventory/
│   ├── transactions/
│   ├── branches/
│   ├── suppliers/
│   ├── reports/
│   ├── media/ (user uploads)
│   └── static/ (static assets)
│   🌐 Server: http://localhost:8000
│
└── ⚛️ pos-frontend/                   # React Frontend (Production)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   ├── assets/ (logo, icons, images)
    │   └── utils/
    ├── public/
    ├── package.json
    └── vite.config.js
    🌐 Server: http://localhost:5173
```

---

## 🎯 QUICK NAVIGATION

**Documentation:**
- Critical Notes → [Dokumen/PROJECT_NOTES_IMPORTANT.md](Dokumen/PROJECT_NOTES_IMPORTANT.md)
- Error Database → [Dokumen/Errors/ERROR_TRACKING.md](Dokumen/Errors/ERROR_TRACKING.md) ⚠️ NEW!
- FLAG System → [Dokumen/FLAG_COMMAND_REFERENCE.md](Dokumen/FLAG_COMMAND_REFERENCE.md)
- Roadmap → [Dokumen/ROADMAP_DEVELOPMENT_SESSIONS.md](Dokumen/ROADMAP_DEVELOPMENT_SESSIONS.md)
- Deployment Guide → [Dokumen/PANDUAN_DEPLOYMENT.md](Dokumen/PANDUAN_DEPLOYMENT.md)

**Production Code:**
- Backend → `pos_backend/`
- Frontend → `pos-frontend/`

**Reference UI:**
- HTML Prototype → `pos-ml-system_dummy/` (untuk reference saja)

---

## 📌 IMPORTANT NOTES

1. **Dokumen/** = Semua dokumentasi (*.md, *.txt)
2. **Dokumen/Errors/** = ⚠️ Tracking semua error (kritis & kecil) terpisah dari docs biasa
3. **pos-ml-system_dummy/** = HTML prototype dummy (BUKAN production)
4. **pos_backend/** = Production Django backend
5. **pos-frontend/** = Production React frontend
6. **FLAG command** = Save checkpoint lengkap (progress + error + trials)

**Error Tracking System:**
- Location: `Dokumen/Errors/ERROR_TRACKING.md`
- Purpose: Database error agar tidak repeat dan mudah search solution
- Format: Error ID, severity, location, impact, solution, prevention
- Categories: 🔴 Critical, 🟡 Medium, 🟢 Minor

---

**Status:** Session 4 Complete (Project Structure Ready)  
**Next:** Session 5 (Database Configuration)
