# Sharma Store

Sharma Store is a mobile-first React storefront prototype backed by Firebase. It combines a product catalogue, authentication, cart and checkout flows, loyalty features, admin screens, notifications, and Progressive Web App support.

## Current status

The repository is an active development project. The frontend is a Vite SPA and the repository also contains Firebase Functions source for notifications. A working production deployment, payment processor, and server-side AI proxy should be verified before this project is presented as a production commerce system.

## Implemented areas

- Product browsing, search, filtering, cart, wishlist, and order history
- Firebase Authentication and Firestore-backed application state
- Admin pages for products, orders, customers, settings, and analytics
- Loyalty points, streaks, rewards, reviews, and notifications
- PWA manifest, service worker, offline fallback, and install prompts
- Optional AI helpers for recommendations, feedback analysis, and notification copy
- Reference UI explorations under `assets/reference_ui/`

The checkout UI includes card, UPI, wallet, and cash-on-delivery selections. The repository does not currently show a connected payment processor, so treat those screens as a product-flow prototype until a payment provider is integrated and tested.

## Tech stack

- React 19 and Vite
- Tailwind CSS, Framer Motion, Lucide React, Recharts, and canvas-confetti
- Firebase Authentication, Firestore, Cloud Messaging, and Functions source
- Vite PWA plugin for installability and offline behavior
- OpenRouter client integration for optional AI helpers

## Local setup

### Prerequisites

- Current Node.js LTS and npm
- A Firebase web app with Authentication and Firestore enabled for full functionality

### Install and run

```bash
git clone https://github.com/mahale800/sharma-store.git
cd sharma-store
npm install
Copy-Item .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

### Environment variables

The Firebase values are read from `.env` at build time:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

`VITE_OPENROUTER_API_KEY` is optional for the current AI helpers. Because `VITE_*` values are bundled into browser JavaScript, this key must not be treated as a server-side secret. Use a restricted development key only, or move the OpenRouter call behind an authenticated server-side function before production use.

## Quality checks

```bash
npm run lint
npm run build
```

The repository currently has no automated test suite. Exercise authentication, Firestore rules, checkout, admin authorization, PWA installation, and notification flows against a test Firebase project before deploying.

## Deployment

The included `vercel.json` configures Vite with `npm run build` and `dist` as the output directory. See [DEPLOYMENT.md](DEPLOYMENT.md) for the environment and Firebase setup checklist.

Do not claim a live demo until the deployment URL has been checked. The previously listed `sharma-store-one.vercel.app` URL returned HTTP 404 during the October 20, 2026 audit.

## Project structure

```text
src/
├── components/       # Shared UI, admin, dashboard, loyalty, and PWA components
├── context/          # Auth, cart, shop, loyalty, notification, and wishlist state
├── data/              # Fallback catalogue and shop profile data
├── firebase/          # Firebase app and messaging setup
├── hooks/             # Analytics, engagement, PWA, performance, and recommendation hooks
├── layouts/           # Public, checkout, and admin layouts
├── pages/             # Customer, checkout, and admin routes
├── services/          # AI, notification, and WhatsApp integrations
└── utils/             # Order state and shared helpers
functions/index.js     # Firebase notification functions source
firestore.rules        # Firestore access rules
vercel.json            # Vercel build and SPA routing configuration
```

## Security review notes

- Firebase web configuration values are intended for client initialization; Firestore rules are the actual data boundary.
- The current AI helper reads `VITE_OPENROUTER_API_KEY` in the browser. That exposes the key to visitors and should be replaced with a server-side proxy before production use.
- The current Firestore rules allow unauthenticated reads of an order document by ID for guest tracking. That returns the full document, so sensitive order fields should be separated or guest tracking should move to a controlled server endpoint.
- Callable notification functions should enforce authentication and administrator authorization before they can be used outside a local test project.
- Never commit `.env`, Firebase service-account credentials, or unrestricted provider keys.

## Contributing

Keep changes focused, run the quality checks above, and open a pull request with a short description of the user-visible and security impact.

## License

This project is distributed under the [MIT License](LICENSE).

## Author

Yash Mahale — [GitHub profile](https://github.com/mahale800)

