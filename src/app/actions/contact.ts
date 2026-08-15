"use server";

import { headers } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

export async function submitContactForm(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  
  // 1. Server-side Honeypot
  if (formData.get("_honey")) {
    // Silently reject bots without letting them know
    return { success: true, message: "Message sent successfully!" };
  }

  // 2. Rate Limiting Check using Admin SDK Firestore
  const safeIp = ip.replace(/[\/\\.#$\[\]]/g, "_"); 
  const adminApp = getFirebaseAdmin();
  
  try {
    const db = adminApp.firestore();
    const rateLimitRef = db.collection("rate_limits").doc(safeIp);
    
    const isAllowed = await db.runTransaction(async (transaction) => {
      const limitDoc = await transaction.get(rateLimitRef);
      if (limitDoc.exists) {
        const data = limitDoc.data()!;
        if (now - data.firstAttempt < RATE_LIMIT_WINDOW_MS) {
          if (data.count >= MAX_REQUESTS_PER_WINDOW) {
            return false; // Deny
          }
          transaction.update(rateLimitRef, { count: data.count + 1 });
          return true; // Allow
        } else {
          transaction.update(rateLimitRef, { count: 1, firstAttempt: now });
          return true; // Allow
        }
      } else {
        transaction.set(rateLimitRef, { count: 1, firstAttempt: now });
        return true; // Allow
      }
    });

    if (!isAllowed) {
      return { success: false, message: "Too many requests. Please try again later." };
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Note: If GOOGLE_APPLICATION_CREDENTIALS are not provided, admin.firestore() will fail here.
    // We fail open so legitimate users aren't blocked by missing credentials.
  }


  // 3. Web3Forms Submission
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("Missing WEB3FORMS_ACCESS_KEY");
    return { success: false, message: "Server configuration error." };
  }

  // Add the access key to the form data
  formData.append("access_key", accessKey);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
      headers: {
        // Use an honest, descriptive User-Agent
        "User-Agent": "Tech254-ContactForm/1.0",
        "Accept": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, message: "Message sent successfully!" };
    } else {
      console.error("Web3Forms error:", result);
      return { success: false, message: result.message || "Failed to send message." };
    }
  } catch (error) {
    console.error("Error submitting to Web3Forms:", error);
    return { success: false, message: "A network error occurred." };
  }
}
