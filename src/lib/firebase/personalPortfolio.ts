import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration for the personal portfolio's public Firebase project (myportfolio-adfaa)
const personalFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_AUTH_DOMAIN || "myportfolio-adfaa.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_PROJECT_ID || "myportfolio-adfaa",
  storageBucket: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_STORAGE_BUCKET || "myportfolio-adfaa.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_MESSAGING_SENDER_ID || "944590627031",
  appId: process.env.NEXT_PUBLIC_PERSONAL_FIREBASE_APP_ID || "1:944590627031:web:c4a676eb0fac7259861092"
};

// Initialize as a named app to avoid conflicts with Tech254's primary Firebase connection
const APP_NAME = "PersonalPortfolioApp";

const personalApp = getApps().find((app) => app.name === APP_NAME) || initializeApp(personalFirebaseConfig, APP_NAME);

export const personalDb = getFirestore(personalApp);
