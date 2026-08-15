import * as admin from 'firebase-admin';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    let credential = undefined;
    if (serviceAccountKey) {
      try {
        const parsedKey = JSON.parse(serviceAccountKey);
        credential = admin.credential.cert(parsedKey);
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON", error);
      }
    }

    admin.initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return admin;
}
