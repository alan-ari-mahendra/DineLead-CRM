# DineLead — Screening Report

> **Mode:** Portfolio Showcase
> **Tanggal screening:** 2026-04-07
> **Stack:** Next.js 15 (App Router) · Prisma · PostgreSQL · NextAuth v4 · BullMQ · Tailwind v4 · shadcn/ui

Dokumen ini memetakan kondisi project DineLead — bug fungsional, fitur belum jalan, dan perbaikan kualitas. **Belum dieksekusi**, hanya mapping.

Karena project ini ditujukan sebagai **portfolio showcase**, item yang membuat pengalaman demo ribet (rate limiting, password policy, email verification, 2FA) sengaja **di-skip**. Fokus ada pada bug yang terlihat saat demo & kualitas kode yang menonjol di review portfolio.

---

## Ringkasan Eksekutif

| Severity | Jumlah |
|---|---|
| 🔴 CRITICAL | 7 |
| 🟠 HIGH | 8 |
| 🟡 MEDIUM | 10 (1 di-skip) |
| 🟢 LOW | 3 |
| **Total relevan** | **27** |

Kategori dominan: Type Safety, Worker Reliability, Schema Integrity, Authorization Filtering, Feature Incomplete.

---

## 🔴 CRITICAL — Security & Data Integrity

| # | File | Line | Masalah |
|---|---|---|---|
| C1 | `.env` | 2-11 | Credentials (DB password plaintext, Supabase service role JWT, `NEXTAUTH_SECRET`) ter-commit ke repo. `GOOGLE_API_KEY` masih placeholder `REPLACE_WITH_YOUR_KEY`. |
| C2 | `app/api/scraping-job/route.ts` | 21-28 | `prisma.scrapingJob.findMany()` tanpa `where: { userId }` → user bisa lihat scraping jobs milik user lain. |
| C3 | `app/api/scraping-job/[slug]/route.ts` | 45-53 | Tidak validasi ownership ScrapingJob sebelum return data → akses by-ID lewat. |
| C4 | `app/api/scrape/route.ts` | 24-33 | GET status job tanpa cek owner. |
| C5 | `app/api/restaurant/activity/route.ts` | 6-40 | POST activity tanpa cek apakah lead milik current user; `restaurantId` di body bisa dimanipulasi. |
| C6 | `app/api/restaurant/notes/route.ts` | 6-30 | POST notes — sama seperti C5. |
| C7 | `prisma/schema.prisma` | 50 | `Lead.name @unique` (global) konflik dengan upsert `where: { companyId, name }` di `app/api/restaurant/route.ts:211`. Restoran dengan nama sama di company berbeda akan **crash saat insert ke-2** — bug demo nyata. |

> 💡 **Catatan showcase:** C2–C6 bukan "pengetatan akses", melainkan **bug fungsional** — tanpa filter `userId`, data seed antar user demo tercampur. Fix-nya cuma menambahkan `where: { userId: session.user.id }`, bukan rate limiting / role system.

---

## 🟠 HIGH — Bugs & Fitur Belum Jalan

| # | File | Line | Masalah |
|---|---|---|---|
| H1 | `app/api/export/route.ts` | 53-59, 162-167 | **Date filtering belum jalan.** Backend hanya `console.log("Date filtering requested but not implemented for Lead model")` — UI menampilkan filter tanggal tapi diabaikan. |
| H2 | `prisma/schema.prisma` | 46-67 | `Lead` model tidak punya `createdAt`. Akibatnya: dashboard trend, ordering, dan H1 (date filter) tidak bisa diimplementasi. Sekarang ordering pakai `id`. |
| H3 | `next.config.mjs` | 3-8 | `eslint.ignoreDuringBuilds: true` + `typescript.ignoreBuildErrors: true`. Semua error TS/lint disembunyikan saat build → bug type silently merged. |
| H4 | `worker/scrapper.worker.ts` | 22, 44-49 | `fetchPlaceDetails` return `res.data.result` tanpa cek status; `place.details` bisa undefined tapi tetap di-save ke `ScrapingData`. |
| H5 | `worker/scrapper.worker.ts` | 30-56 | Tidak handle `res.data.status` Google Maps API: `OVER_QUERY_LIMIT`, `REQUEST_DENIED`, `INVALID_REQUEST`, `ZERO_RESULTS`. Saat quota habis, worker tetap "sukses" dengan data kosong. |
| H6 | `worker/scrapper.worker.ts` | 61-132 | `new Worker("scrape", ...)` tanpa retry/backoff config. Satu kegagalan transient = job permanently failed. |
| H7 | `worker/scrapper.worker.ts` | 7-14, 131 | `GOOGLE_API_KEY` tidak divalidasi di startup; Redis hardcoded `localhost:6379`. Worker crash dengan error tidak jelas kalau Redis off / API key kosong. |
| H8 | `app/api/restaurant/route.ts` | 181-261 | `throw new Error("LeadStatus 'Prospect' tidak ditemukan")` di luar try-catch → 500 + stack trace exposed. `Promise.all(restaurants.map(...))` tanpa error handling per-item → 1 gagal, semua rollback parsial. |

---

## 🟡 MEDIUM — Perbaikan Kualitas

| # | File | Line | Masalah |
|---|---|---|---|
| ~~M1~~ | ~~`app/api/register/route.ts`~~ | ~~5-14~~ | ~~Password strength / rate limiting~~ — **SKIP (showcase)**. Yang tetap dijaga: cek email duplikat & response error bersih. |
| M2 | `package.json` | 49-50 | Dependency duplikat: `bcrypt@^6.0.0` + `bcryptjs@^3.0.2`. `lib/auth.ts` pakai `bcrypt`, `prisma/seed.ts:2` pakai `bcryptjs` — pilih satu. |
| M3 | `app/(protected)/scraping-jobs/[slug]/page.tsx` | 10 | Server component fetch via `axios.get(\`${process.env.NEXTAUTH_URL}/api/...\`)` — `NEXTAUTH_URL` bisa undefined di prod, dan harusnya cukup direct Prisma query. |
| M4 | `components/modals/scraping-modal.tsx` | 37-54 | `userId: user.id` tanpa null check. Crash kalau session belum hydrate. |
| M5 | `components/modals/restaurant-detail-modal.tsx` | 42, 215 | `initRestaurant: any`; `restaurant.company.website` tanpa null guard → crash kalau company null. |
| M6 | `app/(protected)/export/page.tsx` | 32-80 | `fetchTotalCount` `useCallback` dep array berat → multiple concurrent API calls. Debounce hanya 500ms. |
| M7 | `prisma/schema.prisma` | 32-44, 64-66, 116-134 | `Company ↔ ScrapingData ↔ Lead` semua `onDelete: Cascade` berlapis. Hapus 1 `ScrapingData` bisa ikut hapus Company & semua Lead-nya — efek berantai tak terduga. |
| M8 | `prisma/schema.prisma` | — | Tidak ada `@@index` pada `Lead.userId`, `Company.userId`, `LeadActivity.userId`/`leadId`, `ScrapingJob.userId`. Query list akan lambat di dataset besar. |
| M9 | Widespread | — | Penggunaan `any` luas: `worker/scrapper.worker.ts:25,26,115` · `lib/export-utils.ts:27,39,83,106,108,123,125` · `app/api/restaurant/route.ts:23,185` · `app/api/export/route.ts:41,111,151` · `app/api/scraping-job/[slug]/route.ts:31` · `contexts/AuthContext.tsx:8` · `components/scrape-job/details/scrapeDataTableComponent.tsx:63` · `components/modals/restaurant-detail-modal.tsx:42` · `components/restaurants/restaurant-table.tsx:51,71` · `components/export/export-preview.tsx:39`. |
| M10 | `lib/export-utils.ts` | 38-103 | `convertToExcel` async tanpa error handling untuk `workbook.xlsx.writeBuffer()` / batas size. |
| M11 | `prisma/seed.ts` | 40-48 | `console.log` + tanpa `.finally()` untuk `prisma.$disconnect()`. |

---

## 🟢 LOW — Kebersihan Kode

| # | File | Line | Masalah |
|---|---|---|---|
| L1 | `components/restaurants/restaurant-filters.tsx` | 47 | Hanya `console.error` saat fetch filter gagal — user tidak mendapat feedback UI. |
| L2 | `contexts/AuthContext.tsx` | 4, 8 | `useRouter` import redundant; `any` pada context type. |
| L3 | 13+ file | — | `console.log` tertinggal di production: `worker/scrapper.worker.ts` (5x: L86, L105, L116, L136, L140) · `app/api/restaurant/route.ts` (L157, L334) · `app/api/export/route.ts` (4x: L56, L121, L164, L206) · `app/api/dashboard/stats/route.ts` (L202) · `app/(protected)/export/page.tsx` (L60) · `app/(protected)/scraping-jobs/page.tsx` (L80) · `components/modals/scraping-modal.tsx` (3x: L58, L61, L86) · `components/restaurants/restaurantComponent.tsx` (L55) · `components/restaurants/restaurant-filters.tsx` (L47) · `components/export/export-preview.tsx` (L89) · `components/export/export-actions.tsx` (L65) · `prisma/seed.ts` (L40, L45). |

---

## Rekomendasi Prioritas Eksekusi (Mode: Portfolio Showcase)

1. **H1 + H2** — date filtering & `Lead.createdAt`. Fitur visible di UI tapi broken; ini yang akan dilihat reviewer pertama kali.
2. **C1** — bersihkan `.env` dari repo, buat `.env.example`, regenerate `NEXTAUTH_SECRET` + Supabase key + Google API key.
3. **C7** — fix konflik `Lead.name @unique` vs upsert logic. Ini akan crash saat demo multi-company → harus aman.
4. **C2–C6** — tambahkan filter `where: { userId: session.user.id }` (simple ownership). Cukup, jangan over-engineer.
5. **H4–H7** — worker robustness: handle Google API status, validasi env, retry config. Biar scraping tidak silent-fail saat demo live.
6. **H3 + M9** — bertahap hapus `any` lalu aktifkan type check di `next.config.mjs`. Ini "kualitas kode" yang menonjol di portfolio review.
7. **H8, M2–M11** — polish (error handling, schema indexes, dependency cleanup).
8. **L1–L3** — cleanup `console.log` & unused imports (cepat, sapu bersih sebelum publish).
9. ~~**M1 (rate limit, password policy)**~~ — **SKIP**, tidak cocok untuk showcase UX.

---

## Verifikasi Cepat

Untuk memvalidasi report ini, sample-check beberapa item:

```bash
# C1
cat .env

# C7
grep -n "@unique" prisma/schema.prisma
grep -n "upsert" app/api/restaurant/route.ts

# H1
grep -n "Date filtering" app/api/export/route.ts

# H2
grep -n "createdAt" prisma/schema.prisma

# L3 (hitung console.log)
grep -rn "console\.log" app/ components/ worker/ lib/ prisma/
```
