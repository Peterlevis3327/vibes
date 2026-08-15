export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as admin from 'firebase-admin';
import ClientLayout from "./ClientLayout";

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return admin;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get("__session")?.value;

  if (!session) {
    redirect("/admin/login");
  }

  try {
    const adminApp = getFirebaseAdmin();
    await adminApp.auth().verifyIdToken(session);
  } catch (error) {
    console.error("Invalid session:", error);
    redirect("/admin/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
