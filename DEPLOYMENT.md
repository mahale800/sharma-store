# Sharma Store deployment guide

This guide covers the Vite frontend deployment. Configure and test Firebase separately before treating the app as a production commerce system.

## 1. Verify locally

```bash
npm install
npm run lint
npm run build
```

The build output should be generated in `dist/`.

## 2. Configure Vercel

The repository includes `vercel.json` with these settings:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: all routes rewrite to `/index.html`

Add the following variables in the Vercel project for the environments you use:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_VAPID_KEY       # optional, for web push
```

The optional `VITE_OPENROUTER_API_KEY` is currently consumed by browser code. Do not use an unrestricted production key; move AI requests behind a server-side function first.

## 3. Configure Firebase

1. Enable the Firebase Authentication providers used by the app.
2. Create a Firestore database for the target environment.
3. Review and deploy `firestore.rules` and `firestore.indexes.json`.
4. Add the Vercel deployment domain to Firebase Authentication's authorized domains.
5. Seed test products and an explicitly authorized administrator account.

If Firebase Functions are deployed, review `functions/index.js` and add authentication/administrator checks to callable functions before enabling them publicly.

## 4. Deploy

With the repository linked to Vercel, pushing the production branch triggers a deployment. The CLI alternative is:

```bash
npm install --global vercel
vercel login
vercel link
vercel --prod
```

## Post-deployment checklist

- [ ] The deployed URL returns the application rather than a 404
- [ ] Firebase environment variables are present in the deployment
- [ ] Authentication and authorized domains work
- [ ] Firestore rules and indexes are deployed
- [ ] Customer browsing, cart, and order creation work in a test account
- [ ] Admin routes reject non-admin accounts
- [ ] No provider secret appears in the browser bundle
- [ ] PWA install and offline fallback work over HTTPS

