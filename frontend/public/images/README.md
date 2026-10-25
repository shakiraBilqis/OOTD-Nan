# Directory Aset Gambar OOTD-Nan

Folder ini digunakan untuk menyimpan seluruh file gambar dan aset visual yang digunakan di dalam sistem aplikasi:

## Struktur Folder:
- `/images/backgrounds/`: Gambar latar belakang (hero, backdrop, landing page, auth banner).
  - `welcome-hero.jpg`: Gambar busana utama (latar belakang halaman Welcome/Landing page).
- `/images/branding/`: Logo aplikasi, favicon, icon brand, dan badge.
- `/images/system/`: Mockup UI, gambar panduan sistem, dan referensi desain.
  - `welcome-mockup.png`: Referensi mockup halaman awal.
- `/images/placeholders/`: Placeholder pakaian, model avatar, atau ilustrasi default sebelum user mengunggah foto mereka sendiri.

## Cara Penggunaan di Frontend:
1. **Via URL Publik (Static Path):**
   ```tsx
   <img src="/images/backgrounds/welcome-hero.jpg" alt="Hero Outfit" />
   ```
2. **Via CSS Background:**
   ```css
   background-image: url('/images/backgrounds/welcome-hero.jpg');
   ```
3. **Via Import Modul (dari `src/assets/images/`):**
   ```tsx
   import welcomeHero from '@/assets/images/welcome-hero.jpg';
   ```
