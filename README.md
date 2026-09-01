<div align="center">

  <img src="https://capsule-render.vercel.app/render?type=waving&color=gradient&customColorList=0,2,20&height=200&section=header&text=AASHRAY&fontSize=70&fontColor=00f0ff&animation=twinkling&desc=Full-Stack%20Verified%20Luxury%20Hospitality%20Portal&descSize=20&descAlignY=70&descAlign=50" alt="Aashray Banner" width="100%" />

  <br/>

  <a href="#">
    <img src="https://img.shields.io/badge/Security-Cryptographic%20Pass-00f0ff?style=for-the-badge&logo=shield&logoColor=black" alt="Security Badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/RealTime-Socket.io%20v4-010101?style=for-the-badge&logo=socketdotio&logoColor=00f0ff" alt="Socket.io Badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Payment-Razorpay%20Verified-020420?style=for-the-badge&logo=razorpay&logoColor=00f0ff" alt="Razorpay Badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Automation-GitHub%20Actions-181717?style=for-the-badge&logo=githubactions&logoColor=white" alt="Cron Job" />
  </a>

  <br/><br/>

  <p align="center">
    <strong>A modern, enterprise-grade sanctuary booking network engineered with MERN stack, real-time departure verification, and anti-fraud review ledgers.</strong>
  </p>

  <p align="center">
    <a href="#-core-capabilities">Key Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-security--anti-fraud-layer">Security</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-reference-overview">API Docs</a>
  </p>

</div>

---

## ⚡ Core Capabilities

> **Guest Reservation** ➔ **HMAC Verified Razorpay** ➔ **Check-In Key (ASH-XXXX)** ➔ **Real-Time Host Verification** ➔ **Review Unlocked**

* 🛡️ **Cryptographic Departure Passes:** Every reservation mints a tamper-proof departure code (`ASH-XXXX`) required by property managers to complete guest checkouts.
* ⭐ **Anti-Fraud Verified Reviews:** Review submission forms remain strictly locked until a booking transitions to `Checked-Out` status. Eliminates bot reviews and sybil attacks.
* ⚡ **Live Desk Synchronization:** Bi-directional Socket.io communication instantly updates guest booking cards and desk ledgers without browser refresh.
* 💳 **Secure Razorpay Gateway:** Integrated with backend HMAC-SHA256 signature verification to prevent middle-man transaction alterations.
* 📑 **Client-Side Document Engine:** Dynamic client-side PDF generation of booking vouchers with custom QR identity stamps.
* 🤖 **Autonomous Resource Optimization:** GitHub Actions cron pipeline pings backend health endpoints daily at 12:00 PM IST to protect free-tier compute hours while keeping database clusters alive.

---

## 🛠️ Technology Stack

<div align="center">

| Area | Technologies |
| :--- | :--- |
| **Frontend UI/UX** | React 18, Vite 5, Bootstrap 5, Modern CSS Animations |
| **State & API Layer** | Axios Interceptors, Socket.io Client, React Context API |
| **Backend Runtime** | Node.js v20, Express.js 5 |
| **Database & Cache** | MongoDB Atlas, Mongoose ODM |
| **Security & Auditing**| JWT Authentication, Helmet.js, Express-Rate-Limit, HPP Sanitizer |

</div>

---

## 🔒 Security & Anti-Fraud Layer

* **Multi-Layer Auth Fallback:** Verifies authentication using both cross-domain `HTTP-Only` cookies and `Bearer` authorization headers to support modern browser privacy sandboxes.
* **Tiered Rate Limiting:** Dedicated throttle buckets protect critical authentication gates (`/api/auth/login`, `/api/auth/verify-otp`) from brute force and credential-stuffing.
* **NoSQL Injection Shield:** Strips out Mongoose selector keys (`$`, `.`) from request payloads, query strings, and path parameters.
* **Reverse Proxy Aware:** Configured with dynamic `trust proxy` validation to accurately read client IPs behind cloud load balancers.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js v18+ or v20+
* MongoDB Atlas connection string
* Razorpay API Test Keys

### 2. Repository Setup
git clone https://github.com/your-username/aashray-hotel-management.git
cd aashray-hotel-management

### 3. Backend Configuration
cd backend
npm install

Create a `.env` file in the `backend` directory:
PORT=5652
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173
TRUST_PROXY=false
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

Start backend:
npm run dev

### 4. Frontend Configuration
cd ../aashray-frontend
npm install

Create a `.env` file in the `aashray-frontend` directory:
VITE_BACKEND_URL=http://localhost:5652

Start frontend:
npm run dev

---

## 📡 API Reference Overview

### Authentication Gateway
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new guest account & dispatch OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code & activate user | Public |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user identity session | Protected |

### Sanctuary & Reservation Operations
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | Search & filter property listings | Public |
| `GET` | `/api/hotels/:id` | Get sanctuary details with verified reviews | Public |
| `POST` | `/api/hotels/:id/reviews` | Submit verified stay feedback | Verified Guest |
| `POST` | `/api/bookings/verify-checkout`| Confirm departure code (`ASH-XXXX`) | Admin/Owner |

---

## ⚙️ Automated Infrastructure Maintenance

To preserve monthly free instance runtime while keeping MongoDB Atlas clusters warm, Aashray triggers a scheduled GitHub Actions heartbeat:

# .github/workflows/keep-alive.yml
on:
  schedule:
    - cron: '30 6 * * *' # Daily at 12:00 PM IST

---

<div align="center">
  <sub>Built with ❤️ by the Aashray Engineering Team. Licensed under the MIT License.</sub>
</div>