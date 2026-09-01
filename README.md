<div align="center">

  <!-- Animated SVG Typing Header -->
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=40&duration=3000&pause=1000&color=00F0FF&center=true&vCenter=true&width=750&height=90&lines=AASHRAY+PORTAL;FULL-STACK+HOTEL+MANAGEMENT;REAL-TIME+DEPARTURE+LEDGER;VERIFIED+GUEST+REVIEWS" alt="Typing SVG" />
  </a>

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

## 📸 Visual Tour & Feature Showcase

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Sanctuary Explorer" width="100%" style="border-radius: 8px;" />
      <br/>
      <strong>🏨 Dynamic Sanctuary Discovery</strong>
      <p align="left"><em>Real-time filtering by price, guest density, and amenities with verified visual galleries.</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" alt="Admin Control Room" width="100%" style="border-radius: 8px;" />
      <br/>
      <strong>🛡️ Mission Control Admin Room</strong>
      <p align="left"><em>Live desk metrics, inventory management, and guest departure authorization desk.</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" alt="Instant Checkout Passes" width="100%" style="border-radius: 8px;" />
      <br/>
      <strong>🔑 Cryptographic Departure Keys</strong>
      <p align="left"><em>One-time unique <code>ASH-XXXX</code> departure codes for fraud-free guest status updates.</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1556742049-0a67e55722c6?auto=format&fit=crop&w=800&q=80" alt="Instant Razorpay" width="100%" style="border-radius: 8px;" />
      <br/>
      <strong>💳 Razorpay Cryptographic Vault</strong>
      <p align="left"><em>Server-side HMAC-SHA256 signature verification and auto-generated PDF vouchers.</em></p>
    </td>
  </tr>
</table>

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