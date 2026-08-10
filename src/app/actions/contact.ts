"use server";

import { headers } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, runTransaction } from "firebase/firestore";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

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

  // TODO: Send email, save to database, etc.
  console.log("Form submission received:", { name, email, projectType, budget, message });

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true };
}
