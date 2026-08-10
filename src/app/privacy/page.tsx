

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Agency.",
  description: "Our privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full font-sans">
      <section className="px-4 md:px-8 py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16">
        <div className="container mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <p>
            We take your privacy seriously. This privacy policy describes how we collect, use, and protect your personal information. 
            (This is a placeholder page. Please update with your actual legal privacy policy.)
          </p>
        </div>
      </section>
    </div>
  );
}
