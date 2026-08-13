import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration for the personal portfolio's public Firebase project (myportfolio-adfaa)
const personalFirebaseConfig = {
  apiKey: "AIzaSyDCUWQcv6Mr1Qb4ff9EkDWc12w0HHtHpEI",
  authDomain: "myportfolio-adfaa.firebaseapp.com",
  projectId: "myportfolio-adfaa",
  storageBucket: "myportfolio-adfaa.appspot.com",
  messagingSenderId: "944590627031",
  appId: "1:944590627031:web:c4a676eb0fac7259861092"
};

// Initialize as a named app to avoid conflicts with Tech254's primary Firebase connection
const APP_NAME = "PersonalPortfolioApp";

const personalApp = getApps().find((app) => app.name === APP_NAME) || initializeApp(personalFirebaseConfig, APP_NAME);

export const personalDb = getFirestore(personalApp);
