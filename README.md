# Sharma Store 🛍️

> **Next-Gen AI-Powered E-commerce Experience**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Supported-purple?style=for-the-badge&logo=pwa&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-Powered-FF4F00?style=for-the-badge&logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)

---

## 🚀 Overview

**Sharma Store** is a cutting-edge, mobile-first Progressive Web App (PWA) designed to revolutionize the online shopping experience. Built with performance and user engagement in mind, it seamlessly integrates advanced AI capabilities with a robust e-commerce engine.

By leveraging **Groq AI (Llama models)** for intelligent product recommendations and providing a sophisticated admin intelligence dashboard, Sharma Store bridges the gap between traditional retail and the future of digital commerce. It features a fully integrated loyalty system, personalized notifications, and a sleek, modern UI.

---

## ✨ Key Features

### 🛒 Customer Experience
*   **Progressive Web App (PWA)**: Installable on mobile and desktop for a native-app-like experience.
*   **Smart Product Discovery**: AI-driven search and recommendations tailored to user preferences.
*   **Seamless Checkout**: Secure and fast checkout process with integrated payment gateways.
*   **Loyalty System**: Earn points, track streaks, and redeem rewards for exclusive discounts.
*   **Real-time Tracking**: Live order status updates and tracking directly from the dashboard.
*   **Personalized Notifications**: AI-generated notifications with customizable tones (Professional, Friendly, Flirty, Comedy).

### 🛠️ Admin Powerhouse
*   **Intelligence Dashboard**: Real-time analytics and insights into sales and user behavior.
*   **Inventory Management**: Full control over product stock, variations, and categories.
*   **Order Management**: Efficient workflow for processing, shipping, and fulfilling orders.
*   **User Management**: Detailed customer profiles and activity logs.

### 🤖 AI Integration
*   **Smart Recommendations**: Analyzes user behavior to suggest products they'll love.
*   **Automated Copy**: Generates engaging notification and marketing copy dynamically.
*   **Chat Assistant**: (Coming Soon) 24/7 AI customer support assistant.

---

## 💻 Tech Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Core application framework and build tool |
| **Styling** | Tailwind CSS 4 | Utility-first styling and design system |
| **Backend & DB** | Firebase (Auth, Firestore) | Authentication, Database, and Hosting |
| **AI Engine** | Groq SDK (Llama Models) | AI logic for recommendations and text generation |
| **Animations** | Framer Motion | Smooth, complex UI transitions and animations |
| **Icons** | Lucide React | Modern, consistent icon set |
| **PWA** | Vite PWA Plugin | Offline capabilities and installability |

---

## 📱 Screens / Modules

*   **Public**:
    *   `Home`: Landing page with featured products and promotional banners.
    *   `Shop`: Full product catalog with advanced filtering and sorting.
    *   `ProductDetails`: Detailed view with reviews, related items, and add-to-cart.
    *   `Login / Register`: Secure authentication flow.
*   **Private (User)**:
    *   `Cart`: Cart management and price estimation.
    *   `Checkout`: Secure payment and address selection.
    *   `Profile`: User settings, preferences, and loyalty stats.
    *   `MyOrders`: Order history and detailed tracking.
    *   `Wishlist`: Saved items for future purchase.
*   **Admin**:
    *   `Dashboard`: High-level metrics (Revenue, Orders, Active Users).
    *   `Products`: CRUD operations for inventory.
    *   `Orders`: Status updates and fulfillment tracking.

---

## 🏗️ System Architecture

The application follows a **Serverless Mobile-First Architecture**:

1.  **Client**: A React SPA (Single Page Application) served via a high-performance CDN.
2.  **PWA Layer**: Service Workers cache assets and API responses for offline access.
3.  **Backend Services**: 
    *   **Firebase Authentication**: Manages user identity and session security.
    *   **Firestore**: NoSQL database for real-time data syncing (Products, Users, Orders).
    *   **AI Service**: Edge functions calling Groq AI for compute-heavy intelligence tasks.

---

## 📂 Project Folder Structure

```
sharma-store/
├── public/              # Static assets (images, icons, manifest)
├── src/
│   ├── assets/          # Project-specific assets
│   ├── components/      # Reusable UI components
│   ├── context/         # Global state (Shop, Auth, Loyalty, Notification)
│   ├── firebase/        # Firebase configuration and service initialization
│   ├── page/            # Main route components (Home, Shop, Admin, etc.)
│   ├── utils/           # Helper functions and constants
│   ├── App.jsx          # Main application component with Routing
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (Authentication & Keys)
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite bundler configuration
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js**: v18.0.0 or higher
*   **npm**: v9.0.0 or higher
*   **Git**: Latest version

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/sharma-store.git
    cd sharma-store
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (refer to [Environment Variables](#environment-variables-setup)).

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root of your project and add the following keys. 
> **Note:** You will need your own Firebase and Groq API keys.

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Configuration
VITE_GROQ_API_KEY=your_groq_api_key
```

---

## 📦 Build and Deployment

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` directory. You can deploy this folder to any static hosting provider like **Netlify**, **Vercel**, or **Firebase Hosting**.

---

## 🛡️ Security Overview

*   **Authentication**: All sensitive routes (Checkout, Profile, Admin) are protected by `AuthGuard`.
*   **Role-Based Access**: Admin routes are strictly gated and require specific user privileges.
*   **Data Protection**: Firestore security rules ensure users can only access their own data.
*   **Environment Safety**: Sensitive keys are kept in `.env` and excluded from Git.

---

## ⚡ Performance Optimizations

*   **Lazy Loading**: Routes and heavy components are code-split and loaded on demand.
*   **Asset Optimization**: Images are optimized, and SVGs are used for icons.
*   **PWA Caching**: Service workers cache critical assets for instant load times on repeat visits.
*   **Efficient State**: React Context is optimized to minimize re-renders.

---

## 🛣️ Future Roadmap

- [ ] **Voice Search Integration**: Voice-enabled product search.
- [ ] **AR Try-On**: Augmented Reality for viewing products in 3D.
- [ ] **Multi-Language Support**: i18n implementation for global access.
- [ ] **Advanced Analytics**: Deeper integration with Google Analytics 4.

---

## 🤝 Contribution Guide

Contributions are welcome! Please fork the repository and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🔧 Troubleshooting

### App shows blank/white screen
- Check browser console for errors
- Verify Firebase credentials in `.env` are correct
- Ensure environment variables are set in Vercel (for production)

### Products not loading
- Check Firestore security rules are deployed
- Verify products collection exists in Firebase
- Check browser console for permission errors

### Authentication not working
- Ensure Firebase Authentication is enabled in Firebase Console
- Check that authorized domains include your deployment URL
- Verify Google Sign-in provider is configured (if using)

### Build errors
- Clear `node_modules` and run `npm install` again
- Delete `dist` folder before building
- Check Node.js version (v18+ required)

### PWA not working
- Service workers require HTTPS (Vercel provides this)
- Clear browser cache and reload
- Check DevTools → Application → Service Workers

For more detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [FIX_SUMMARY.md](./FIX_SUMMARY.md).

---

<p align="center">
  Built with ❤️ by the <strong>Sharma Store Engineering Team</strong>
</p>
