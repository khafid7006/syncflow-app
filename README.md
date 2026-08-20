# ⚡ SyncFlow 1.0

> **Bento-Powered Agile Delivery & Governance Operating System**  
> Platform manajemen sprint, orkestrasi tugas, dan tata kelola delivery terpadu berbasis peran (Business Owner, Project Owner, Project Leader, Pod PIC, & Tim Pelaksana).

---

## ✨ Fitur Utama

- **Bento Execution Hub (`/do`)**: Ruang kerja fokus satu tugas dengan pelacakan Definition of Done (DoD), checklist mandiri, dan submit tautan deliverable.
- **Hierarchical Governance**: Pemisahan hak verifikasi multi-tingkat (Member $\rightarrow$ Pod Owner $\rightarrow$ Project Owner).
- **Role-Based Community Hub (`/community`)**: Kanal koordinasi terisolasi per tim dan peran (Executive Sync, Sprint Governance, Pod BA/PB/QA/MG).
- **Cloud Persistence**: Terintegrasi penuh dengan PostgreSQL Supabase untuk sinkronisasi data real-time.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Design System**: Frosted Glass Aesthetic, Bento Grid Layout, JetBrains Mono
- **Database & Auth**: Supabase (PostgreSQL)
- **Deployment**: Vercel

---

## 🚀 Panduan Memulai (Local Setup)

### 1. Kloning & Instalasi
```bash
git clone https://github.com/khafid7006/syncflow-app.git
cd syncflow-app
npm install
```

### 2. Konfigurasi Environment Variable
Buat file `.env.local` di direktori utama proyek:
```env
VITE_SUPABASE_URL=https://bvjyqotpaenglurlnwjb.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database Supabase
Salin isi file `supabase-schema.sql` dan jalankan di SQL Editor pada Dashboard Supabase Anda.

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Akses aplikasi lokal di `http://localhost:3000`.

---

## 📄 Lisensi
Di bawah lisensi [MIT](LICENSE). Dibuat dengan 🧡 untuk efisiensi delivery tim produk.
