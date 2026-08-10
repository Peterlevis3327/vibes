export const revalidate = 60;

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Agency.",
  description: "Our terms of service.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full font-sans">
      <section className="px-4 md:px-8 py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16">
        <div className="container mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <p>
            These terms of service govern your use of our website and services.
            (This is a placeholder page. Please update with your actual legal terms of service.)
          </p>
        </div>
      </section>
    </div>
  );
}
