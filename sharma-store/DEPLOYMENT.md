# Sharma Store - Vercel Deployment Guide

## Environment Variables Required

Add these environment variables in your Vercel Dashboard:
1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development** environments:

### Firebase Configuration (Required)
```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Optional: AI Features
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

## How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon)
4. Scroll down to "Your apps" section
5. Select the **Web** app (or create one if not exists)
6. Copy the `firebaseConfig` values to Vercel environment variables

## Firestore Security Rules

Make sure to deploy Firestore rules. In Firebase Console:
1. Go to **Firestore Database** → **Rules**
2. Deploy the rules from `firestore.rules` file
3. Also deploy indexes from `firestore.indexes.json`

## Build Settings

Vercel should auto-detect these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting

### Blank Page / White Screen
- Check browser console for errors
- Verify all environment variables are set correctly
- Check Vercel deployment logs for build errors

### Firebase Authentication Not Working
- Ensure Firebase credentials are correct
- Check Firebase Console → Authentication → Sign-in method is enabled
- Verify authorized domains in Firebase Console

### Products Not Loading
- Check Firestore rules are deployed
- Verify products collection exists in Firestore
- Check browser console for permission errors

### PWA Not Working
- Service workers require HTTPS (Vercel provides this)
- Clear browser cache and reload
- Check browser DevTools → Application → Service Workers

## Deployment Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Firestore rules deployed
- [ ] Firestore indexes created
- [ ] Firebase Authentication enabled (Email/Google)
- [ ] Test user registration and login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test admin dashboard (if applicable)
- [ ] Test PWA installation
- [ ] Check browser console for errors
