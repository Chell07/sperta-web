```markdown
# Sperta Web

Sperta Web adalah sebuah aplikasi web yang dibangun menggunakan ekosistem React modern. Proyek ini dibuat untuk menyediakan antarmuka pengguna yang responsif dan interaktif, dengan dukungan integrasi backend dari Firebase.

## 🚀 Fitur Utama

- **Antarmuka Pengguna Responsif**: Desain yang dioptimalkan untuk berbagai ukuran layar, dari perangkat seluler hingga desktop, menggunakan Tailwind CSS.
- **Routing Dinamis**: Menggunakan `react-router-dom` untuk navigasi halaman yang mulus tanpa perlu memuat ulang browser (Single Page Application).
- **Integrasi Firebase**: Siap digunakan dengan berbagai layanan Firebase (Hosting, Firestore, Authentication, dll.) melalui konfigurasi di `src/firebase.ts`.
- **Ikon Kustom**: Memanfaatkan pustaka `lucide-react` untuk ikon-ikon vektor yang ringan dan mudah disesuaikan.
- **Dukungan Media**: Dilengkapi dengan pemutar musik bawaan dan galeri gambar yang terorganisir di dalam direktori `public/`.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi-teknologi mutakhir berikut:

- **[React 18](https://react.dev/)**: Pustaka JavaScript untuk membangun antarmuka pengguna.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset JavaScript yang menambahkan pengetikan statis untuk pengembangan yang lebih aman.
- **[Vite](https://vitejs.dev/)**: Build tool yang sangat cepat untuk pengembangan web modern.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first untuk styling yang cepat dan konsisten.
- **[Firebase](https://firebase.google.com/)**: Platform Backend-as-a-Service (BaaS) dari Google.
- **[ESLint](https://eslint.org/) & [PostCSS](https://postcss.org/)**: Untuk linting kode dan pemrosesan CSS.

## 📋 Prasyarat Instalasi

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:

- **Node.js** (Versi 18.x atau yang lebih baru direkomendasikan)
- **npm**, **yarn**, atau **pnpm** (sebagai package manager)
- **Git** (untuk kloning repositori)

## 🏗️ Susunan Proyek

Berikut adalah struktur direktori utama dari proyek ini:

```text
sperta-web/
├── public/               # Aset statis (gambar, musik, favicon, dll.) yang dapat diakses publik
├── src/                  # Kode sumber utama aplikasi
│   ├── App.tsx           # Komponen utama React yang mengatur struktur aplikasi
│   ├── firebase.ts       # Konfigurasi dan inisialisasi layanan Firebase
│   ├── index.css         # File CSS global, termasuk direktif Tailwind
│   └── main.tsx          # Titik masuk (entry point) aplikasi React
├── .env.example          # Contoh variabel lingkungan (environment variables)
├── eslint.config.js      # Konfigurasi ESLint
├── firebase.json         # Konfigurasi layanan Firebase (seperti Hosting)
├── package.json          # Metadata proyek dan daftar dependensi
├── tailwind.config.js    # Konfigurasi Tailwind CSS
├── tsconfig.json         # Konfigurasi compiler TypeScript
└── vite.config.ts        # Konfigurasi Vite
```

## 💻 Cara Instalasi dan Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda:

1. **Kloning repositori:**
   ```bash
   git clone [https://github.com/username/sperta-web.git](https://github.com/username/sperta-web.git)
   cd sperta-web
   ```

2. **Instal dependensi:**
   Menggunakan npm:
   ```bash
   npm install
   ```
   Atau menggunakan yarn:
   ```bash
   yarn install
   ```

3. **Konfigurasi Environment:**
   Salin file `.env.example` menjadi `.env` dan isi variabel yang diperlukan (terutama konfigurasi Firebase Anda).
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   # atau yarn dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

5. **Build untuk Produksi:**
   Untuk menghasilkan file statis yang siap di-deploy:
   ```bash
   npm run build
   ```

6. **Preview Build Produksi:**
   ```bash
   npm run preview
   ```

## 🤝 Kontribusi

Kami sangat menyambut kontribusi dari siapa saja! Jika Anda ingin berkontribusi, silakan ikuti langkah-langkah berikut:

1. Lakukan *Fork* pada repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b fitur/FiturLuarBiasa`).
3. Lakukan *commit* perubahan Anda (`git commit -m 'Menambahkan Fitur Luar Biasa'`).
4. Lakukan *push* ke *branch* tersebut (`git push origin fitur/FiturLuarBiasa`).
5. Buat *Pull Request* baru.

Pastikan kode Anda mengikuti standar linting proyek ini dengan menjalankan `npm run lint` sebelum membuat Pull Request.

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**. 

Hak Cipta (c) 2026 Tim Sperta

Dengan ini diberikan izin, secara cuma-cuma, kepada siapa pun yang mendapatkan salinan perangkat lunak ini dan file dokumentasi terkait ("Perangkat Lunak"), untuk memperlakukan Perangkat Lunak tanpa batasan, termasuk namun tidak terbatas pada hak untuk menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan/atau menjual salinan Perangkat Lunak, dan untuk mengizinkan orang yang kepadanya Perangkat Lunak ini diberikan untuk melakukan hal tersebut, dengan tunduk pada ketentuan berikut:

Pemberitahuan hak cipta di atas dan pemberitahuan izin ini harus disertakan dalam semua salinan atau bagian substansial dari Perangkat Lunak.

PERANGKAT LUNAK INI DISEDIAKAN "SEBAGAIMANA ADANYA", TANPA JAMINAN APAPUN, BAIK TERSURAT MAUPUN TERSIRAT, TERMASUK NAMUN TIDAK TERBATAS PADA JAMINAN KELAYAKAN UNTUK DIPERDAGANGKAN, KESESUAIAN UNTUK TUJUAN TERTENTU DAN TIDAK ADANYA PELANGGARAN. DALAM KEADAAN APAPUN PENULIS ATAU PEMEGANG HAK CIPTA TIDAK BERTANGGUNG JAWAB ATAS KLAIM, KERUSAKAN, ATAU KEWAJIBAN LAINNYA, BAIK DALAM TINDAKAN KONTRAK, PELANGGARAN ATAU LAINNYA, YANG TIMBUL DARI, DARI ATAU SEHUBUNGAN DENGAN PERANGKAT LUNAK ATAU PENGGUNAAN ATAU TRANSAKSI LAINNYA DALAM PERANGKAT LUNAK.
```
