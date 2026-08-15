"use server";

import { cookies } from "next/headers";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin for token verification (only requires projectId)
export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return admin;
}

export async function createSession(idToken: string) {
  try {
    const adminApp = getFirebaseAdmin();
    // Verify the token using Firebase Admin
    await adminApp.auth().verifyIdToken(idToken);
    
    // Set the cookie
    cookies().set("__session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to verify ID token:", error);
    return { success: false, error: "Invalid token" };
  }
}

export async function removeSession() {
  cookies().delete("__session");
  return { success: true };
}
