# 💊 PharmaFlow — Complete Next.js Frontend Integration & Architecture Guide

> **Target Frontend Stack:** Next.js 15+ (App Router) + Redux Toolkit (RTK Query) + TailwindCSS + Lucide Icons + Framer Motion  
> **Backend Base URL:** `http://localhost:3000/api/v1`  
> **Global API Wrapper Format:**  
> ```typescript
> interface ApiResponse<T> {
>   success: boolean;
>   statusCode: number;
>   message: string;
>   data: T;
> }
> ```

---

## 🎨 ১. Design System, Color Palette & UI Tokens

PharmaFlow-এর মেইল টেমপ্লেট এবং ব্র্যান্ড আইডেন্টিটির সাথে মিল রেখে একটি **Ultra-Modern, Vibrant Emerald-Teal & Medical Slate** প্যালেট নির্বাচন করা হয়েছে। এতে গ্লাস মরফিজম (Glassmorphism), স্মুথ গ্রেডিয়েন্ট এবং মাইক্রো-অ্যানিমেশন থাকবে।

### ১.১ Color Palette Tokens
| Token | Hex Code | HSL / Tailwind Equivalent | ব্যবহার |
|---|---|---|---|
| **Primary** | `#0D9488` | `teal-600` | মেইন অ্যাকশন, বোতাম, লোগো, অ্যাক্টিভ স্ট্যাটাস |
| **Primary Light** | `#14B8A6` | `teal-500` | হোভার স্টেট, বাটন ব্যাকগ্রাউন্ড হাইলাইট |
| **Primary Gradient** | `linear-gradient(135deg, #0D9488 0%, #059669 100%)` | `from-teal-600 to-emerald-600` | হেডার, হিরো সেকশন, ব্যানার, প্রিমিয়াম কার্ড |
| **Secondary (Accent)** | `#0284C7` | `sky-600` | লিংক, ব্যাজ, ইনফো কার্ড, ক্যালকুলেশন ভ্যালু |
| **Tertiary (Surface)** | `#0F172A` / `#1E293B` | `slate-900` / `slate-800` | ডার্ক মোড ব্যাকগ্রাউন্ড, টেক্সট কালার, সাইডবার |
| **Background (Light)**| `#F8FAFC` | `slate-50` | লাইট মোড মেইন ব্যাকগ্রাউন্ড |
| **Card (Light)** | `#FFFFFF` (80% Glass) | `bg-white/80 backdrop-blur-md` | গ্লাস মরফিক কার্ড ও মোডাল |
| **Success** | `#10B981` | `emerald-500` | স্টক ওকে, ভেরিফাইড ইউজার, সফল ট্রানজাকশন |
| **Warning** | `#F59E0B` | `amber-500` | লো-স্টক অ্যালার্ট, মেয়াদ দ্রুত শেষ হওয়ার অ্যালার্ট |
| **Danger / Expired** | `#EF4444` | `rose-500` | মেয়াদ শেষ, ইনভ্যালিড টোকেন, মুছে ফেলার বোতাম |

### ১.২ Typography & Shadows
- **Font Family:** `Inter`, `Plus Jakarta Sans` অথবা `Outfit` (Google Fonts)
- **Glassmorphism Border:** `border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-teal-500/5`
- **Hover Transitions:** `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl`

---

## 📡 ২. Full Backend API Reference for RTK Query

সবগুলো API-তে Bearer Token হেডারে পাঠাতে হবে (ব্যতিক্রম: পাবলিক Auth এন্ডপয়েন্ট)।

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

### ২.১ Authentication Module (`/auth`)

#### ১. Register
- **Endpoint:** `POST /auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Sadid Ahmed",
  "email": "sadid@pharmaflow.com",
  "password": "Password123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful! Please check your email for the 6-digit OTP verification code.",
  "data": {
    "id": "user-uuid",
    "name": "Sadid Ahmed",
    "email": "sadid@pharmaflow.com",
    "role": "PHARMACY_OWNER",
    "isVerified": false,
    "isBlocked": false
  }
}
```

#### ২. Login
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "sadid@pharmaflow.com",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully logged in!",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

#### ৩. Verify OTP (Registration Verification)
- **Endpoint:** `POST /auth/verify-otp`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "sadid@pharmaflow.com",
  "otp": "482910"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account verified and logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "user-uuid",
      "email": "sadid@pharmaflow.com",
      "name": "Sadid Ahmed",
      "role": "PHARMACY_OWNER",
      "isVerified": true
    }
  }
}
```

#### ৪. Resend OTP
- **Endpoint:** `POST /auth/resend-otp`
- **Access:** Public
- **Request Body:** `{ "email": "sadid@pharmaflow.com" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "A new verification code has been sent to your email.",
  "data": null
}
```

#### ৫. Forgot Password (Step 1 of Password Reset)
- **Endpoint:** `POST /auth/forgot-password`
- **Access:** Public
- **Request Body:** `{ "email": "sadid@pharmaflow.com" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "A password reset code has been sent to your email.",
  "data": null
}
```

#### ৬. Verify Reset OTP (Step 2 of Password Reset)
- **Endpoint:** `POST /auth/verify-reset-otp`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "sadid@pharmaflow.com",
  "otp": "839201"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "resetToken": "eyJhbGciOi..."
  }
}
```

#### ৭. Reset Password (Step 3 of Password Reset)
- **Endpoint:** `POST /auth/reset-password`
- **Access:** Public
- **Request Body:**
```json
{
  "resetToken": "eyJhbGciOi...",
  "newPassword": "NewStrongPassword123!",
  "confirmPassword": "NewStrongPassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password has been reset successfully! You can now log in with your new password.",
  "data": null
}
```

#### ৮. Refresh Access Token
- **Endpoint:** `POST /auth/refresh-token`
- **Access:** Public
- **Request Body:** `{ "refreshToken": "eyJhbGciOi..." }`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully!",
  "data": {
    "accessToken": "eyJhbGciOi..."
  }
}
```

#### ৯. User Profile
- **Endpoint:** `GET /auth/profile`
- **Access:** Bearer Token Protected
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "You have accessed a protected route!",
  "data": {
    "id": "user-uuid",
    "email": "sadid@pharmaflow.com",
    "role": "PHARMACY_OWNER"
  }
}
```

---

### ২.২ Pharmacy Store Module (`/pharmacy`)

#### ১. Create / Setup Pharmacy
- **Endpoint:** `POST /pharmacy`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Request Body:**
```json
{
  "name": "PharmaFlow Central Pharmacy",
  "address": "House 12, Road 5, Dhanmondi, Dhaka",
  "phone": "+8801700000000"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Pharmacy created successfully!",
  "data": {
    "id": "pharmacy-uuid",
    "name": "PharmaFlow Central Pharmacy",
    "address": "House 12, Road 5, Dhanmondi, Dhaka",
    "phone": "+8801700000000",
    "ownerId": "user-uuid",
    "createdAt": "2026-10-24T06:00:00.000Z"
  }
}
```

#### ২. Get My Pharmacy
- **Endpoint:** `GET /pharmacy/my`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pharmacy details fetched successfully",
  "data": {
    "id": "pharmacy-uuid",
    "name": "PharmaFlow Central Pharmacy",
    "address": "Dhanmondi, Dhaka",
    "phone": "+8801700000000",
    "ownerId": "user-uuid",
    "_count": {
      "medicines": 48
    }
  }
}
```

#### ৩. Update My Pharmacy
- **Endpoint:** `PATCH /pharmacy/my`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Request Body:** `{ "name": "Updated Pharmacy Name", "phone": "+8801900000000" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pharmacy updated successfully!",
  "data": { "id": "pharmacy-uuid", "name": "Updated Pharmacy Name" ... }
}
```

#### ৪. Get All Pharmacies (Super Admin View)
- **Endpoint:** `GET /pharmacy`
- **Access:** Protected (`SUPER_ADMIN` only — via `RolesGuard`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully!",
  "data": [
    {
      "id": "pharmacy-uuid",
      "name": "PharmaFlow Dhanmondi",
      "address": "Dhaka",
      "phone": "+8801700000000",
      "owner": {
        "id": "owner-uuid",
        "name": "Sadid Ahmed",
        "email": "sadid@pharmaflow.com",
        "phone": null
      },
      "_count": { "medicines": 120 }
    }
  ]
}
```

---

### ২.৩ Medicine Inventory Module (`/medicines`)

#### ১. Add New Medicine
- **Endpoint:** `POST /medicines`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Request Body:**
```json
{
  "name": "Napa Extra 500mg",
  "genericName": "Paracetamol + Caffeine",
  "category": "Tablet",
  "buyingPrice": 2.10,
  "sellingPrice": 3.00,
  "stock": 250,
  "mfgDate": "2026-01-10T00:00:00.000Z",
  "expDate": "2027-12-31T00:00:00.000Z"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Medicine added successfully!",
  "data": {
    "id": "medicine-uuid",
    "name": "Napa Extra 500mg",
    "genericName": "Paracetamol + Caffeine",
    "category": "Tablet",
    "buyingPrice": "2.10",
    "sellingPrice": "3.00",
    "stock": 250,
    "mfgDate": "2026-01-10T00:00:00.000Z",
    "expDate": "2027-12-31T00:00:00.000Z",
    "pharmacyId": "pharmacy-uuid"
  }
}
```

#### ২. Get All Medicines (Search & Filter)
- **Endpoint:** `GET /medicines?search=napa&category=Tablet`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Query Params:**
  - `search` (Optional): মেডিসিনের নাম বা জেনেরিক নাম দিয়ে সার্চ
  - `category` (Optional): যেমন `Tablet`, `Syrup`, `Capsule`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully!",
  "data": [
    {
      "id": "medicine-uuid",
      "name": "Napa Extra 500mg",
      "genericName": "Paracetamol + Caffeine",
      "category": "Tablet",
      "buyingPrice": "2.10",
      "sellingPrice": "3.00",
      "stock": 250,
      "expDate": "2027-12-31T00:00:00.000Z"
    }
  ]
}
```

#### ৩. Get Low Stock Alert Medicines
- **Endpoint:** `GET /medicines/low-stock?threshold=10`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Query Params:** `threshold` (Default: `10`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully!",
  "data": [
    {
      "id": "med-1",
      "name": "Ace Plus",
      "stock": 4,
      "category": "Tablet"
    }
  ]
}
```

#### ৪. Get Expiring Soon Medicines
- **Endpoint:** `GET /medicines/expiring-soon?days=30`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Query Params:** `days` (Default: `30` দিন)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully!",
  "data": [
    {
      "id": "med-2",
      "name": "Ceevit 250mg",
      "expDate": "2026-11-15T00:00:00.000Z",
      "stock": 45
    }
  ]
}
```

#### ৫. Get Single Medicine Details
- **Endpoint:** `GET /medicines/:id`
- **Access:** Protected (`PHARMACY_OWNER`)

#### ৬. Update Medicine Details
- **Endpoint:** `PATCH /medicines/:id`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Request Body:** Partial Fields (e.g. `{ "stock": 300, "sellingPrice": 3.50 }`)

#### ৭. Delete Medicine
- **Endpoint:** `DELETE /medicines/:id`
- **Access:** Protected (`PHARMACY_OWNER`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Medicine deleted successfully!",
  "data": null
}
```

---

### ২.৪ Dashboard Analytics Module (`/dashboard`)

#### ১. Get Dashboard Metrics (Role-Based Smart Endpoint)
- **Endpoint:** `GET /dashboard/stats`
- **Access:** Protected (`SUPER_ADMIN` or `PHARMACY_OWNER`)

##### যদি লগইন করা ইউজার `SUPER_ADMIN` হন:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin dashboard overview retrieved",
  "data": {
    "role": "SUPER_ADMIN",
    "totalUsers": 120,
    "activeUsers": 115,
    "blockedUsers": 5,
    "totalPharmacies": 88,
    "totalMedicinesCount": 6540
  }
}
```

##### যদি লগইন করা ইউজার `PHARMACY_OWNER` হন:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pharmacy dashboard metrics retrieved",
  "data": {
    "role": "PHARMACY_OWNER",
    "totalMedicines": 142,
    "totalStockUnits": 8560,
    "lowStockCount": 5,
    "expiringSoonCount": 2,
    "inventoryValuation": {
      "totalCostValue": 128400.00,
      "totalSalesValue": 179200.00,
      "potentialProfit": 50800.00
    }
  }
}
```

---

## 🏗️ ৩. Next.js 15+ App Router Project Structure

```
pharmaflow-frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── sounds/                 # নোটিফিকেশন অ্যালার্ট সাউন্ড (ঐচ্ছিক)
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx          # Root Layout (Redux Provider, Toaster, Theme)
│   │   ├── page.tsx            # Modern Landing / Hero Page
│   │   ├── globals.css         # Tailwind & Custom Gradient Utilities
│   │   │
│   │   ├── (auth)/             # Auth Group Route
│   │   │   ├── layout.tsx      # Centered Glassmorphic Card Layout
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (dashboard)/        # Protected App Routes
│   │   │   ├── layout.tsx      # Sidebar + Header + Mobile Drawer Layout
│   │   │   ├── dashboard/page.tsx        # Smart Role-Based Dashboard
│   │   │   │
│   │   │   ├── pharmacy/
│   │   │   │   ├── setup/page.tsx        # ওনার প্রথমবার আসলে সেটআপ পেজ
│   │   │   │   └── settings/page.tsx     # ফার্মেসির প্রোফাইল ও এডিট
│   │   │   │
│   │   │   ├── medicines/
│   │   │   │   ├── page.tsx              # অ্যানিমেটেড গ্রিড ও ফিল্টার ভিউ
│   │   │   │   ├── new/page.tsx          # ঔষধ অ্যাড করার ফর্ম
│   │   │   │   ├── [id]/edit/page.tsx    # ঔষধ এডিট করার পেজ
│   │   │   │   ├── low-stock/page.tsx    # স্টক অ্যালার্ট ডেডিকেটেড ভিউ
│   │   │   │   └── expiring/page.tsx     # মেয়াদোত্তীর্ণ ঔষধ ভিউ
│   │   │   │
│   │   │   └── admin/                    # শুধুমাত্র Super Admin ভিউ
│   │   │       ├── pharmacies/page.tsx   # সব ফার্মেসির তালিকা
│   │   │       └── users/page.tsx        # ইউজার মনিটরিং ও ব্লক/আনব্লক
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Button, Input, Modal, Badge, Dropdown
│   │   ├── layout/             # Sidebar, Navbar, MobileNav, UserMenu
│   │   ├── dashboard/          # MetricCard, ProfitCard, QuickStats
│   │   ├── medicines/          # MedicineCard (Hover, Gradient, Stock Badge), MedicineTable
│   │   └── shared/             # SearchInput, LoadingSpinner, EmptyState
│   │
│   ├── redux/                  # Redux Toolkit & RTK Query
│   │   ├── store.ts
│   │   ├── ReduxProvider.tsx
│   │   ├── slices/
│   │   │   └── authSlice.ts    # User, Token, Role State & LocalStorage
│   │   └── api/
│   │       ├── baseApi.ts      # RTK Query Base with Automatic Token Injector
│   │       ├── authApi.ts      # Login, Register, Forgot Password Hooks
│   │       ├── pharmacyApi.ts  # My Pharmacy, Update Hooks
│   │       ├── medicineApi.ts  # CRUD, Low-Stock, Expiring Hooks
│   │       └── dashboardApi.ts # Stats Hook
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Auth state & current user role
│   │   └── useDebounce.ts      # সার্চ ইনপুটের জন্য ডিবাউন্স হুক
│   │
│   ├── lib/
│   │   ├── utils.ts            # cn (clsx + tailwind-merge)
│   │   └── constants.ts
│   │
│   └── middleware.ts           # Next.js Route Protection & Role Redirect
```

---

## ⚡ ৪. Redux Toolkit (RTK Query) Architecture

### ৪.১ `baseApi.ts` (অটোমেটিক টোকেন ইন্টারসেপ্টর)
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Pharmacy', 'Medicines', 'Dashboard', 'User'],
  endpoints: () => ({}),
});
```

### ৪.২ `medicineApi.ts` উদাহরণ
```typescript
import { baseApi } from './baseApi';

export const medicineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: (params) => ({
        url: '/medicines',
        params: { search: params?.search, category: params?.category },
      }),
      providesTags: ['Medicines'],
    }),
    getLowStockMedicines: builder.query({
      query: (threshold = 10) => `/medicines/low-stock?threshold=${threshold}`,
      providesTags: ['Medicines'],
    }),
    createMedicine: builder.mutation({
      query: (body) => ({
        url: '/medicines',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Medicines', 'Dashboard', 'Pharmacy'],
    }),
    updateMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicines/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Medicines', 'Dashboard'],
    }),
    deleteMedicine: builder.mutation({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medicines', 'Dashboard', 'Pharmacy'],
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetLowStockMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
```

---

## 🖥️ ৫. Page-by-Page Routing & Layout Guide

### ৫.১ Root Layout (`src/app/layout.tsx`)
- **দায়িত্ব:** 
  - `ReduxProvider` দিয়ে পুরো অ্যাপ র‍্যাপ করা।
  - `Toaster` (Sonner বা React-Hot-Toast) সেট করা।
  - গুগল ফন্ট (`Inter` / `Outfit`) এবং মেটাডাটা সেট করা।

### ৫.২ Auth Group (`src/app/(auth)/...`)
- **লেআউট:** মাঝখানে ভাসমান গ্লাস মরফিক কার্ড (`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl p-8`)। ব্যাকগ্রাউন্ডে নরম Teal-Emerald অ্যাম্বিয়েন্ট ব্লার সার্কেল।
- **পেজগুলো:**
  1. `/login`: ইমেইল ও পাসওয়ার্ড ইনপুট। লগইন সফল হলে ওনারকে রিডাইরেক্ট করবে `/dashboard`-এ।
  2. `/register`: নাম, ইমেইল, পাসওয়ার্ড। সাবমিট করলে ওটিপি পাঠানো হবে এবং `/verify-otp?email=...` পেজে নিয়ে যাবে।
  3. `/verify-otp`: ৬টি আলাদা ওটিপি বক্স (অটো-ফোকাস)। রিসেন্ড ওটিপি কাউন্টডাউন টাইমার (যেমন ৬০ সেকেন্ড)।
  4. `/forgot-password`: ইমেইল চাওয়া হবে। সাবমিট হলে `/reset-password?email=...` এ পাঠানো হবে।
  5. `/reset-password`: ওটিপি ইনপুট, নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড। সফল হলে সরাসরি লগইন পেজে পাঠানো হবে।

### ৫.৩ Dashboard Layout (`src/app/(dashboard)/layout.tsx`)
- **সাইডবার (Sidebar):**
  - ডার্ক/লাইট মোড সাপোর্টেড গ্রেডিয়েন্ট লোগো `💊 PharmaFlow`।
  - ইউজার রোল অনুযায়ী ডাইনামিক মেনু:
    - **Owner Menu:** Dashboard, Medicines, Low Stock, Expiring, Pharmacy Settings.
    - **Admin Menu:** Dashboard, All Pharmacies, User Control.
- **টপবার (Header):**
  - ফার্মেসির নাম ব্যাজ (`PharmaFlow Central Pharmacy`)।
  - লো-স্টক নোটিফিকেশন বেল আইকন (অ্যানিমেটেড পালস ব্যাজ)।
  - ইউজার প্রোফাইল অ্যাভাটার ও ড্রপডাউন (Logout বোতাম সহ)।

### ৫.৪ Dashboard Page (`src/app/(dashboard)/dashboard/page.tsx`)
- **লজিক:** `useGetDashboardStatsQuery()` কল করবে।
- **ফার্মেসি ওনার ভিউ:**
  - **Hero Stats Grid:** 
    1. *Total Medicines* (আইকন: Pill, কালার: Teal)
    2. *Total Stock Units* (আইকন: Boxes, কালার: Sky)
    3. *Low Stock Warning* (আইকন: AlertTriangle, কালার: Amber, ক্লিক করলে লো-স্টক পেজে যাবে)
    4. *Expiring Soon* (আইকন: Clock, কালার: Rose)
  - **Financial Valuation Card (Gradient Background):**
    - `Total Cost`: ৳ ১২৮,৪০০
    - `Expected Sales`: ৳ ১৭৯,২০০
    - `Projected Profit`: ৳ ৫০,৮০০ (Green Neon Glow Badge)
- **সুপার অ্যাডমিন ভিউ:**
  - মোট ফার্মেসি, মোট ইউজার, একটিভ বনাম ব্লকড ইউজার চার্ট এবং প্ল্যাটফর্ম মেডিসিন কাউন্ট।

### ৫.৫ Medicines Page (`src/app/(dashboard)/medicines/page.tsx`)
- **কম্পোনেন্ট:**
  - শীর্ষে **Action Bar:** রিয়েল-টাইম সার্চ ইনপুট (Debounced), ক্যাটাগরি ড্রপডাউন এবং **`+ Add Medicine`** বোতাম (Teal Gradient)।
  - **Interactive Medicine Card:**
    - কার্ডের উপরে ক্যাটাগরি ট্যাগ (`Tablet`, `Syrup`)।
    - মেডিসিনের বড় নাম এবং নিচে হালকা রঙে জেনেরিক নাম।
    - **স্টক ব্যাজ:** 
      - স্টক > ২০ হলে: সবুজ ব্যাজ (`In Stock: 150`)
      - স্টক <= ১০ হলে: অ্যাম্বার পালসিং ব্যাজ (`Low Stock: 4`)
      - স্টক = ০ হলে: লাল ব্যাজ (`Out of Stock`)
    - ক্রয়মূল্য বনাম বিক্রয়মূল্য (মার্জিন পারসেন্টেজ সহ)।
    - মেয়াদোত্তীর্ণ তারিখের কাউন্টডাউন।
    - হোভার করলে অ্যাকশন মেনু (Edit, Delete, Stock Update) স্মুথ ট্রানজিশনে ভেসে উঠবে।

---

## 🎛️ ৬. Framer Motion & CSS Animation Guidelines

ফ্রন্টএন্ডে প্রিমিয়াম ফিল আনতে নিচের ক্লাস ও অ্যানিমেশনগুলো ব্যবহার করতে হবে:

```typescript
// Framer Motion Card Animation
export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
  whileHover: { y: -4, transition: { duration: 0.2 } },
};

// Pulse Alert Badge for Low Stock (Tailwind)
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
</span>
```

---

## 🛡️ ৭. Middleware Protection (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  // লগইন ছাড়া ড্যাশবোর্ডে ঢুকতে বাধা দেওয়া
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // অলরেডি লগইন থাকলে লগইন পেজে ঢুকতে না দিয়ে ড্যাশবোর্ডে পাঠানো
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/medicines/:path*', '/login', '/register'],
};
```

---

## 🚀 ৮. ফ্রন্টএন্ড শুরু করার কমান্ড

```bash
# ১. Next.js 15+ অ্যাপ তৈরি
npx create-next-app@latest pharmaflow-frontend --typescript --tailwind --eslint --app --src-dir

# ২. প্রয়োজনীয় প্যাকেজ ইনস্টল
npm i @reduxjs/toolkit react-redux lucide-react framer-motion clsx tailwind-merge sonner
```

এই ডকটি অনুসরণ করে আপনি খুব সহজেই Next.js ফ্রন্টএন্ডে Redux Toolkit ও RTK Query দিয়ে সম্পূর্ণ **PharmaFlow System** তৈরি করে নিতে পারবেন!
