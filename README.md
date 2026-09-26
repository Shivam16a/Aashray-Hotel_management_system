<div align="center">

  <!-- Animated SVG Typing Header -->
  <a href="https://aashray-hotel-management-system.vercel.app">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=40&duration=3000&pause=1000&color=00F0FF&center=true&vCenter=true&width=750&height=90&lines=AASHRAY+PORTAL;FULL-STACK+HOTEL+MANAGEMENT;REAL-TIME+DEPARTURE+LEDGER;VERIFIED+GUEST+REVIEWS" alt="Typing SVG" />
  </a>

  <br/>

  <a href="https://aashray-hotel-management-system.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-Visit%20Platform-00f0ff?style=for-the-badge&logo=vercel&logoColor=010101" alt="Live Demo" />
  </a>
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
    <strong>A modern, enterprise-grade sanctuary booking network engineered with the MERN stack, real-time departure verification, and anti-fraud review ledgers.</strong>
  </p>

  <p align="center">
    <a href="https://aashray-hotel-management-system.vercel.app">🌐 <strong>Explore Live Demo</strong></a> •
    <a href="#-core-capabilities">Key Features</a> •
    <a href="#%EF%B8%8F-technology-stack">Tech Stack</a> •
    <a href="#-security--anti-fraud-layer">Security</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-reference-overview">API Docs</a>
  </p>

</div>

---

## 🌐 Live Deployment

Experience the fully responsive and real-time application in action:
* **Production URL:** [https://aashray-hotel-management-system.vercel.app](https://aashray-hotel-management-system.vercel.app)

---

## 📸 Visual Tour & Feature Showcase

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Sanctuary Explorer" width="100%" style="border-radius: 8px;" />
      <br/><br/>
      <strong>🏨 Dynamic Sanctuary Discovery</strong>
      <p align="left"><em>Real-time filtering by price, guest density, and amenities with verified visual galleries.</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" alt="Admin Control Room" width="100%" style="border-radius: 8px;" />
      <br/><br/>
      <strong>🛡️ Mission Control Admin Room</strong>
      <p align="left"><em>Live desk metrics, inventory management, and guest departure authorization desk.</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" alt="Instant Checkout Passes" width="100%" style="border-radius: 8px;" />
      <br/><br/>
      <strong>🔑 Cryptographic Departure Keys</strong>
      <p align="left"><em>One-time unique <code>ASH-XXXX</code> departure codes for fraud-free guest status updates.</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80" alt="Instant Razorpay Vault" width="100%" style="border-radius: 8px;" />
      <br/><br/>
      <strong>💳 Razorpay Cryptographic Vault</strong>
      <p align="left"><em>Server-side HMAC-SHA256 signature verification and auto-generated PDF vouchers.</em></p>
    </td>
  </tr>
</table>

---

## ⚡ Core Capabilities

```
[Guest Reservation] ──> [HMAC Verified Razorpay] ──> [Check-In Key (ASH-XXXX)] ──> [Real-Time Host Verification] ──> [Review Unlocked]
```

* 🛡️ **Cryptographic Departure Passes:** Every reservation mints a tamper-proof departure code (`ASH-XXXX`) required by property managers to complete guest checkouts.
* ⭐ **Anti-Fraud Verified Reviews:** Review submission forms remain strictly locked until a booking transitions to `Checked-Out` status, eliminating bot reviews and Sybil attacks.
* ⚡ **Live Desk Synchronization:** Bi-directional Socket.io communication instantly updates guest booking cards and desk ledgers without browser refresh.
* 💳 **Secure Razorpay Gateway:** Integrated with backend HMAC-SHA256 signature verification to prevent middle-man transaction alterations.
* 📑 **Client-Side Document Engine:** Dynamic client-side PDF generation of booking vouchers with custom QR identity stamps.
* 🤖 **Autonomous Resource Optimization:** GitHub Actions cron pipeline pings backend health endpoints daily at 12:00 PM IST to protect free-tier compute hours while keeping database clusters alive.

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI/UX** | React 18 • Vite 5 • Bootstrap 5 • Modern CSS Animations |
| **State & API Layer** | Axios Interceptors • Socket.io Client • React Context API |
| **Backend Runtime** | Node.js v20 • Express.js 5 |
| **Database & Cache** | MongoDB Atlas • Mongoose ODM |
| **Deployment & Hosting**| Vercel (Frontend) • Render / Cloud (Backend) |
| **Security & Auditing**| JWT Authentication • Helmet.js • Express-Rate-Limit • HPP Sanitizer |

</div>

---

## 🔒 Security & Anti-Fraud Layer

* **Multi-Layer Auth Fallback:** Verifies authentication using both cross-domain `HTTP-Only` cookies and `Bearer` authorization headers to support modern browser privacy sandboxes.
* **Tiered Rate Limiting:** Dedicated throttle buckets protect critical authentication gates (`/api/auth/login`, `/api/auth/verify-otp`) from brute force and credential-stuffing attacks.
* **NoSQL Injection Shield:** Strips out Mongoose selector keys (`$`, `.`) from request payloads, query strings, and path parameters.
* **Reverse Proxy Aware:** Configured with dynamic `trust proxy` validation to accurately read client IPs behind cloud load balancers.

---

## 🚀 Getting Started

### Project Structure
```text
aashray-hotel-management/
├── .github/
│   └── workflows/
│       └── keep-alive.yml
├── aashray-frontend/          # React + Vite Client
│   ├── src/
│   ├── package.json
│   └── .env.example
└── backend/                   # Node.js + Express API
    ├── config/
    ├── controllers/
    ├── models/
    ├── package.json
    └── .env.example
```

### 1. Prerequisites
* Node.js v18+ or v20+
* MongoDB Atlas connection string
* Razorpay API Test Keys

### 2. Repository Setup
```bash
git clone https://github.com/Shivam16a/Aashray-Hotel_management_system
cd Aashray-Hotel_management_system
```

### 3. Backend Configuration
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
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
```

Start the backend development server:
```bash
npm run dev
```

### 4. Frontend Configuration
```bash
cd ../aashray-frontend
npm install
```

Create a `.env` file in the `aashray-frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:5652
```

Start the frontend client:
```bash
npm run dev
```

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

```yaml
name: Keep-Alive Heartbeat

on:
  schedule:
    - cron: '30 6 * * *' # Daily at 12:00 PM IST

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend Server
        run: |
          curl -I https://aashray-hotel-management-system.onrender.com/api/health || echo "Ping failed"
```

---

<div align="center">
  <sub>Built with ❤️ by Shivam.</sub>
</div>