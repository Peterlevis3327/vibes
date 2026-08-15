"use server";

import { cookies } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

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
