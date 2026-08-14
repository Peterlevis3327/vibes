"use server";

import { headers } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, runTransaction } from "firebase/firestore";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

export async function submitContactForm(formData: FormData) {
  // 1. Honeypot check
  const honey = formData.get('_honey');
  if (honey) {
    // Silently succeed to fool bots
    return { success: true };
  }

  // 2. Rate Limiting Check using Firestore
  // Get IP from headers (works on Vercel/Next.js)
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown-ip";
  // Replace invalid characters for Firestore document IDs
  const safeIp = ip.replace(/[\/\\.#$\[\]]/g, "_"); 
  
  const now = Date.now();
  const rateLimitRef = doc(db, "rate_limits", safeIp);
  
  try {
    const isAllowed = await runTransaction(db, async (transaction) => {
      const limitDoc = await transaction.get(rateLimitRef);
      if (limitDoc.exists()) {
        const data = limitDoc.data();
        if (now - data.firstAttempt < RATE_LIMIT_WINDOW_MS) {
          if (data.count >= MAX_REQUESTS_PER_WINDOW) {
            return false; // Deny
          }
          // Increment count
          transaction.update(rateLimitRef, { count: data.count + 1 });
          return true; // Allow
        } else {
          // Reset window
          transaction.update(rateLimitRef, { count: 1, firstAttempt: now });
          return true; // Allow
        }
      } else {
        // First attempt
        transaction.set(rateLimitRef, { count: 1, firstAttempt: now });
        return true; // Allow
      }
    });

    if (!isAllowed) {
      return { success: false, error: "Too many requests. Please try again later." };
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open if Firestore is unreachable to prevent blocking legitimate users, 
    // or fail closed if security is paramount. We fail open here.
  }

  // 3. Process the form
  const name = formData.get('name');
  const email = formData.get('email');
  const projectType = formData.get('projectType');
  const budget = formData.get('budget');
  const message = formData.get('message');

  if (!name || !email || !message) {
    return { success: false, error: "Missing required fields." };
  }

  try {
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      console.error("Missing WEB3FORMS_ACCESS_KEY environment variable.");
      return { success: false, error: "Server configuration error. Please try again later." };
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: name,
        email: email,
        projectType: projectType,
        budget: budget,
        message: message,
        subject: "New Contact Form Submission",
        from_name: "Agency Portfolio Contact Form",
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      console.error("Web3Forms error:", result);
      return { success: false, error: "Failed to send message. Please try again later." };
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}
