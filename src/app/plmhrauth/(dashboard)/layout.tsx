export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import ClientLayout from "./ClientLayout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/plmhrauth/login");
  }

  try {
    const adminApp = getFirebaseAdmin();
    await adminApp.auth().verifyIdToken(session);
  } catch (error) {
    console.error("Invalid session:", error);
    redirect("/plmhrauth/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
