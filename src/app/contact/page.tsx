

import { Metadata } from "next";
import { getGlobalSettings, getPageData } from "@/lib/firebase/db";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Agency.",
  description: "Get in touch with our team to discuss your next digital product, mobile app, or website project.",
};

export default async function ContactPage() {
  const [settings, pageData] = await Promise.all([
    getGlobalSettings(),
    getPageData("contact")
  ]);

  return <ContactClient whatsappNumber={settings.whatsappNumber} whatsappMessage={settings.whatsappMessage} pageData={pageData} />;
}
