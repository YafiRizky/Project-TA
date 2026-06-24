# 🚩 FLAG COMMAND - SAVE CHECKPOINT SYSTEM

**Created:** 10 Februari 2026  
**Purpose:** Memory system untuk AI agar tidak lupa progress, error, dan trial yang sudah dilakukan

---

## 📖 DEFINISI "FLAG"

**FLAG** = **SAVE CHECKPOINT** komprehensif dari semua yang sudah dikerjakan

Ketika user bilang **"FLAG"**, AI harus:
1. ✅ **PAUSE** - Stop pekerjaan current
2. ✅ **SAVE** - Dokumentasikan semua progress
3. ✅ **LOG** - Catat error, trial, solusi yang sudah dicoba
4. ✅ **CHECKPOINT** - Buat snapshot state project saat ini

---

## 🎯 APA YANG HARUS DISAVE SAAT FLAG?

### 1. **Progress Project**
- Session berapa yang baru selesai
- Apa yang sudah berhasil dibuat/dikerjakan
- File/folder apa yang sudah dibuat
- Kode apa yang sudah ditulis

### 2. **Error & Problem**
- Error apa yang muncul (error message lengkap)
- Di file/line mana error terjadi
- Apa penyebab error
- Bagaimana cara fix error tersebut
- ⚠️ **IMPORTANT:** Error kritis/berpengaruh harus juga dicatat di `Dokumen/Errors/ERROR_TRACKING.md`

### 3. **Trial & Solution**
- Percobaan apa yang sudah dicoba
- Solusi mana yang berhasil
- Solusi mana yang gagal (agar tidak dicoba lagi)
- Workaround yang dipakai

### 4. **Code State**
- Struktur folder terakhir
- Dependencies yang terinstall
- Configuration yang sudah diubah
- Server/service apa yang running

### 5. **Next Action**
- Apa yang harus dikerjakan selanjutnya
- Task yang tertunda (jika ada)
- Blocker yang harus diselesaikan dulu

---

## 📝 FORMAT CHECKPOINT FLAG

```markdown
# 🚩 FLAG CHECKPOINT - [NAMA SESSION]

**Date:** [Tanggal]
**Time:** [Waktu]
**Current Session:** Session X - [Nama Session]

---

## ✅ COMPLETED TASKS

1. [Task 1] - Status: ✅ Success
2. [Task 2] - Status: ✅ Success
3. [Task 3] - Status: ⚠️ Partial (dengan catatan)

---

## 🐛 ERRORS ENCOUNTERED

### Error #1: [Nama Error]
**Error Message:**
```
[Full error message]
```

**Location:** [File:Line atau Terminal]
**Cause:** [Penyebab error]
**Solution:** [Cara fix yang berhasil]
**Status:** ✅ Resolved / ⚠️ Workaround / ❌ Unresolved

---

### Error #2: [Nama Error]
[Same format as above]

---

## 🔬 TRIALS & EXPERIMENTS

### Trial #1: [Nama Trial]
**What:** [Apa yang dicoba]
**Why:** [Kenapa dicoba]
**Result:** ✅ Success / ❌ Failed
**Notes:** [Catatan important]

### Trial #2: [Nama Trial]
[Same format]

---

## 📂 PROJECT STATE

**Folder Structure:**
```
[Tree structure current]
```

**Files Created/Modified:**
- [File 1] - Status: Created/Modified
- [File 2] - Status: Created/Modified

**Dependencies Installed:**
- Backend: [list packages]
- Frontend: [list packages]

**Servers Running:**
- Backend: http://localhost:XXXX - Status: ✅ Running / ❌ Stopped
- Frontend: http://localhost:XXXX - Status: ✅ Running / ❌ Stopped

---

## 🔧 CONFIGURATIONS CHANGED

**Django settings.py:**
- [Config 1]: [Value]
- [Config 2]: [Value]

**React package.json:**
- [Config 1]: [Value]

**Environment Variables:**
- [Var 1]: [Value/Description]

---

## 🚀 NEXT ACTIONS

**Immediate Next:**
1. [Task 1] - Priority: High/Medium/Low
2. [Task 2] - Priority: High/Medium/Low

**Blockers:**
- [Blocker 1] - Must resolve before continuing
- [Blocker 2] - Optional enhancement

**Nice to Have:**
- [Task 1] - Can be done later
- [Task 2] - Future improvement

---

## 📊 SESSION PROGRESS

**Overall Roadmap:**
- ✅ Session 1-X: [Done]
- 🔄 Session X: [Current - X% done]
- ⏳ Session X+1: [Next]

**Overall Progress:** X/24 sessions = X% complete

---

## 💡 IMPORTANT NOTES

**Lessons Learned:**
- [Lesson 1]
- [Lesson 2]

**Things to Remember:**
- [Important note 1]
- [Important note 2]

**Warnings/Caveats:**
- [Warning 1]
- [Warning 2]

---

**Saved By:** AI Assistant
**Can Resume From:** This checkpoint
**Next Session:** [Session Name]
```

---

## 🔄 CARA PAKAI FLAG SYSTEM

### User Side:
```
User: "FLAG"
```

### AI Response:
1. ✅ Recognize command FLAG
2. ✅ Create checkpoint document dengan format di atas
3. ✅ Fill semua section dengan detail lengkap
4. ✅ Save sebagai `FLAG_CHECKPOINT_SESSION_X.md` di folder `Dokumen/`
5. ✅ Confirm ke user: "✅ FLAG checkpoint saved"

---

## 📁 CHECKPOINT FILES NAMING

**Format:** `FLAG_CHECKPOINT_SESSION_[NUMBER]_[DATE].md`

**Examples:**
- `FLAG_CHECKPOINT_SESSION_4_2026-02-10.md`
- `FLAG_CHECKPOINT_SESSION_5_2026-02-11.md`

**Location:** `C:\laragon\www\TA\Dokumen\`

---

## 🎯 BENEFITS

1. **Memory Preservation** - AI bisa ingat semua detail di conversation berikutnya
2. **Error History** - Tidak mengulang error yang sama
3. **Solution Database** - Referensi solusi yang sudah berhasil
4. **Progress Tracking** - Tahu persis sudah sampai mana
5. **Easy Resume** - Bisa lanjut kerja dari checkpoint terakhir dengan konteks lengkap

---

## ⚠️ CRITICAL RULES

1. **ALWAYS RESPOND** to FLAG command (jangan skip atau ignore)
2. **BE COMPREHENSIVE** - Detail lebih baik dari pada kurang
3. **INCLUDE CODE** - Copy error message, command yang dijalankan, dll
4. **TIMESTAMP EVERYTHING** - Tanggal dan waktu penting untuk tracking
5. **UPDATE THIS DOC** - Jika ada improvement ke format FLAG, update dokumen ini

---

## 📚 RELATED DOCUMENTS

- [PROJECT_NOTES_IMPORTANT.md](PROJECT_NOTES_IMPORTANT.md) - Critical project notes
- [ROADMAP_DEVELOPMENT_SESSIONS.md](ROADMAP_DEVELOPMENT_SESSIONS.md) - Session roadmap
- [CHECKPOINT_SESSION_*.md](.) - Session completion checkpoints (different from FLAG)
- [Errors/ERROR_TRACKING.md](Errors/ERROR_TRACKING.md) - **Dedicated error database** (kritis & kecil)

**Difference:**
- `CHECKPOINT_SESSION_X.md` = Summary after session complete (clean)
- `FLAG_CHECKPOINT_SESSION_X.md` = Detailed snapshot including errors/trials (comprehensive)
- `Errors/ERROR_TRACKING.md` = **Dedicated error-only database** (searchable, separate from docs)

**When to use each:**
- **FLAG Checkpoint** → Save full session state (progress + errors summary)
- **Error Tracking** → Log detail error yang kritis/berpengaruh (untuk reference jangka panjang)
- **Regular Checkpoint** → Summary bersih untuk milestone documentation

---

**Last Updated:** 10 Februari 2026  
**Status:** Active - Ready to use
