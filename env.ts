
// ======================================================================
// IMPORTANT: CONFIGURATION FILE
// ======================================================================
// This file contains all the secret keys and configuration for your app.
//
// FOR LOCAL DEVELOPMENT:
// 1. Replace the placeholder values below with your actual keys.
//
// FOR NETLIFY DEPLOYMENT (RECOMMENDED):
// 1. Go to your Netlify site's "Build & deploy" -> "Environment" settings.
// 2. Add new environment variables for each of the keys below.
//    - The variable name must match exactly (e.g., `API_KEY`, `FIREBASE_API_KEY`).
//    - The value should be your secret key.
// 3. The deployed app will automatically use these variables.
//    DO NOT COMMIT YOUR REAL KEYS TO A PUBLIC REPOSITORY.
// ======================================================================

export const env = {
  // --- Admin User ---
  // The user with this username will have admin rights (e.g., to upload global notes)
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',

  // --- Google Gemini API Key ---
  // Get this from Google AI Studio.
  API_KEY: process.env.API_KEY || 'YOUR_GEMINI_API_KEY_HERE',

  // --- Firebase Configuration ---
  // Get this from your Firebase project settings.
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY_HERE',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_FIREBASE_AUTH_DOMAIN_HERE',
    projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID_HERE',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_FIREBASE_STORAGE_BUCKET_HERE',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE',
    appId: process.env.FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID_HERE',
  },
};
