// Firebase Admin configuration for backend (Free Spark Plan - No Storage)
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin with service account
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // No storageBucket for free plan
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = null; // Not using Firebase Storage for free plan

module.exports = {
  admin,
  db,
  auth,
  storage
};
