

import { Metadata } from "next";
import { getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | Agency.",
  description: "Our privacy policy.",
};

export default async function PrivacyPage() {
  const pageData = await getPageData("privacy");

  return (
    <div className="flex flex-col w-full font-sans">
      <PageHeader 
        title={pageData?.title ?? "Privacy Policy"}
        subtitle={pageData?.subtitle ?? `Last updated: ${new Date().toLocaleDateString()}`}
        backgroundImage={pageData?.headerBackgroundImage}
        backgroundImageVisibility={pageData?.backgroundImageVisibility}
        titleColor={pageData?.titleColor}
        titleFontSize={pageData?.titleFontSize}
        titleX={pageData?.titleX}
        titleY={pageData?.titleY}
        titleWidth={pageData?.titleWidth}
        titleMobileOverride={pageData?.titleMobileOverride}
        titleMobileX={pageData?.titleMobileX}
        titleMobileY={pageData?.titleMobileY}
        titleMobileWidth={pageData?.titleMobileWidth}
        titleMobileFontSize={pageData?.titleMobileFontSize}
        subtitleColor={pageData?.subtitleColor}
        subtitleFontSize={pageData?.subtitleFontSize}
        subtitleX={pageData?.subtitleX}
        subtitleY={pageData?.subtitleY}
        subtitleWidth={pageData?.subtitleWidth}
        subtitleMobileOverride={pageData?.subtitleMobileOverride}
        subtitleMobileX={pageData?.subtitleMobileX}
        subtitleMobileY={pageData?.subtitleMobileY}
        subtitleMobileWidth={pageData?.subtitleMobileWidth}
        subtitleMobileFontSize={pageData?.subtitleMobileFontSize}
      />

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
