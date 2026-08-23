"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidatePublicRoutes(collectionName: string, docId?: string) {
  try {
    // Clear the persistent Data Cache for this collection
    revalidateTag(collectionName);
    
    if (collectionName === "portfolio") {
      revalidatePath("/portfolio");
      if (docId) revalidatePath(`/portfolio/${docId}`);
      revalidatePath("/"); 
    } else if (collectionName === "services") {
      revalidatePath("/services");
      revalidatePath("/"); 
    } else if (collectionName === "posts") {
      revalidatePath("/posts");
      if (docId) revalidatePath(`/posts/${docId}`);
    } else if (collectionName === "team") {
      revalidatePath("/about");
    } else if (collectionName === "testimonials") {
      revalidatePath("/testimonials");
      revalidatePath("/portfolio", "layout"); 
    } else if (collectionName === "faqs") {
      revalidatePath("/process");
      revalidatePath("/");
    } else if (collectionName === "pages") { 
      if (docId === "home") {
        revalidatePath("/");
      } else if (docId) {
        revalidatePath(`/${docId}`);
      }
    } else if (collectionName === "settings") {
      revalidatePath("/", "layout");
    } else if (collectionName === "process") {
      revalidatePath("/process");
    }
    return { success: true };
  } catch (error) {
    console.warn("Failed to revalidate cache:", error);
    return { success: false };
  }
}
