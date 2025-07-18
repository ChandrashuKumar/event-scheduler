# 🗓️ Smart Event Scheduler

A full-stack web application that enables teams to effortlessly coordinate common availability and schedule meetings — powered by **Next.js**, **Firebase Auth**, **Supabase PostgreSQL**, and **Prisma**.
Checkout Live at https://event-scheduler-lovat-seven.vercel.app/

---

## 🚀 Features

- 🔐 Google Sign-In with Firebase Authentication
- 👥 Create & Join Groups with unique IDs
- 📆 Submit your availability for specific days & time slots
- 🤝 View common time slots across group members
- 🧠 Intelligent merging of user availability
- 📋 Skeleton loaders and polished UI for seamless UX
- ⚡ Optimized data fetching using **SWR** for caching & revalidation
- 🧑‍💼 Admin can copy group ID for sharing
- 📊 Prisma ORM for clean database interaction
- ☁️ Deployed via **Vercel**

---

## 🛠️ Tech Stack

- **Frontend & Backend**: Next.js (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Firebase Auth (Google provider)
- **Styling**: Tailwind CSS
- **Notifications**: React Toastify
- **Data Fetching & Caching**: SWR
- **Loading UI**: react-loading-skeleton

---

## 📦 Folder Structure

```
/src
  /app               # Next.js routes and pages
  /components        # Reusable UI components
  /context           # Firebase auth context provider
  /lib               # Firebase Admin & client setup
  /generated/prisma  # Prisma client output
  /api               # API routes (group, availability)
```

---

## 🧪 Local Development

### 1. Clone and Install

```bash
git clone https://github.com/your-username/event-scheduler.git
cd event-scheduler
npm install
```

### 2. Environment Setup

Create a `.env` file with the following:

```
DATABASE_URL=your_postgres_db_url
DIRECT_URL=your_direct_postgres_url
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

If you're using a `firebase-admin-key.json`, base64 encode it and set it in Vercel as:

```
FIREBASE_ADMIN_KEY_BASE64=base64_encoded_json
```

### 3. Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Locally

```bash
npm run dev
```

---

## 🔐 Auth Configuration

- Uses Firebase Auth (Google provider)
- Handles session persistence via custom `AuthContext`
- Server routes validate JWTs using Firebase Admin SDK

---

## 📤 Deployment

Deployed via **Vercel**.

Ensure all secrets are added to Vercel's Environment Variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` or `FIREBASE_ADMIN_KEY_BASE64`

---

## 🧑‍💻 Future Improvements

- 📱 Responsive mobile-first layout
- 📅 Calendar-style date/time picker
- 🔔 Email notifications for new availability
- 📈 Admin dashboard for analytics

---

## 🙌 Acknowledgements

Built as a solo project for learning and exploration in real-world full-stack development.

---

## 📜 License

MIT License
