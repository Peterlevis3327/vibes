import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only requires projectId for auth verification, 
// but requires GOOGLE_APPLICATION_CREDENTIALS for Firestore)
export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return admin;
}
