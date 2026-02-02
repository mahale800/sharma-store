# Sharma Store - Premium E-Commerce PWA

A modern, high-performance E-commerce Progressive Web App (PWA) built for speed and aesthetics. Features an AI Shopping Assistant, Real-time Analytics, and a seamless checkout flow.

![Sharma Store Badge](https://img.shields.io/badge/Status-Production%20Ready-green)

## 🚀 Key Features

### 🛍️ Core Shopping
- **Modern UI**: Glassmorphism design, "Outfit" typography, and branded orange theme.
- **Product Discovery**: Search, Categories, and AI-powered "Recommended for You".
- **Cart & Checkout**: Persistent cart, address management, and optimized checkout flow.
- **PWA**: Installable on Mobile/Desktop, Offline support, and custom install prompt.

### 🤖 AI Integration
- **Shopping Assistant**: Floating ChatBot powered by Groq (Llama 3) for customer support.
- **Hybrid Recommendations**: Smart product suggestions based on user context (Home/Cart/Product).

### ⚡ Admin & Analytics
- **Dashboard**: Real-time sales charts, KPI cards, and "Top Products" analytics.
- **Management**: Full CRUD for Products and Order status management.
- **Role-Based Access**: Secure Admin routes protected by email verification.

### 🔔 Notifications
- **WhatsApp Integration**: Automated order confirmations sent to Admin via WhatsApp API stub.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React
- **Data & Auth**: Firebase (Firestore, Auth)
- **AI**: Groq SDK (Llama 3 8b)
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/sharma-store.git
    cd sharma-store
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_GROQ_API_KEY=your_groq_api_key_here
    ```
    *Note: Firebase config is located in `src/firebase/firebase.js`.*

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 📦 Build for Production

1.  **Build**
    ```bash
    npm run build
    ```
    Output will be in the `dist` folder.

2.  **Preview Build**
    ```bash
    npm run preview
    ```

## 🔐 Admin Access (Dev)

To access the Admin Panel during development:
1.  Sign Up/Login with any email.
2.  In Firestore, go to `users` collection -> find your user ID -> set `role: "admin"`.
3.  Navigate to `/admin/dashboard`.

## 📱 PWA Verification

- **Install**: Click the "Install" banner on mobile/desktop.
- **Offline**: Disconnect internet; the app will show a custom "You are offline" banner and disable checkout.

---

> **Note**: This project is ready for deployment on Vercel, Netlify, or Firebase Hosting. Ensure `.env` variables are set in your deployment provider settings.
