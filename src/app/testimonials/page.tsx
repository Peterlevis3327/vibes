


import { Metadata } from "next";
import { getTestimonials, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";

export const metadata: Metadata = {
  title: "Testimonials | Tech254",
  description: "Read what our clients have to say about working with us.",
};

export default async function TestimonialsPage() {
  const [testimonials, pageData] = await Promise.all([
    getTestimonials(),
    getPageData("testimonials")
  ]);
  
  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title={pageData?.title ?? null}
        subtitle={pageData?.subtitle ?? undefined}
        backgroundImage={pageData?.headerBackgroundImage}
        backgroundImageVisibility={pageData?.backgroundImageVisibility}
        titleColor={pageData?.titleColor}
        titleX={pageData?.titleX}
        titleY={pageData?.titleY}
        subtitleColor={pageData?.subtitleColor}
        subtitleX={pageData?.subtitleX}
        subtitleY={pageData?.subtitleY}
      />

      <section className="px-4 md:px-8 py-24">
        <div className="container mx-auto max-w-6xl">
          <TestimonialsSection testimonials={testimonials} />
        </div>
      </section>
    </div>
  );
}
