

import { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services | Tech254",
  description: "Explore our capabilities in web development, mobile apps, and UI/UX design.",
};

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getServices, getPageData } from "@/lib/firebase/db";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServicesPage() {
  const [services, pageData] = await Promise.all([
    getServices(),
    getPageData("services")
  ]);

  // Sort services by order
  const sortedServices = [...services].sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

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

      <section className="px-4 md:px-8 py-20">
        <div className="container mx-auto max-w-5xl">
          {sortedServices.length === 0 ? (
            <div className="text-center py-24 border rounded-3xl bg-card">
              <h2 className="text-2xl font-bold mb-3">Services Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We&apos;re currently updating our service offerings. Check back soon for detailed information about our capabilities.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {sortedServices.map((service: any, index: number) => {
                const isMobile = service.category?.toLowerCase().includes('mobile');
                // Resolve the description: prefer shortDescription, fall back to fullDescription
                const description = service.shortDescription || service.fullDescription || service.description || "";
                // features may be stored as `features` (admin uses that field name)
                const featureItems: string[] = service.features || service.includes || [];

                return (
                  <div
                    key={service.id || index}
                    className="border rounded-3xl overflow-hidden bg-card shadow-sm"
                  >
                    {/* Service Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-8 border-b">
                      {service.screenshotImage?.url && (
                        <div className="flex-shrink-0">
                          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border flex items-center justify-center bg-muted">
                            <Image
                              src={service.screenshotImage.url}
                              alt={service.screenshotImage.alt || service.title}
                              fill
                              className={isMobile ? "object-contain p-2" : "object-cover"}
                              sizes="80px"
                            />
                          </div>
                          {service.screenshotImage?.showCaption && service.screenshotImage?.caption && (
                            <p className="text-xs text-muted-foreground mt-2 italic text-center max-w-[80px]">
                              {service.screenshotImage.caption}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h2 className="text-2xl md:text-3xl font-bold">{service.title}</h2>
                          {service.category && (
                            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {service.category}
                            </span>
                          )}
                        </div>
                        {description && (
                          <p className="text-muted-foreground leading-relaxed">{description}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 sm:self-start">
                        <Link href="/contact" className={buttonVariants({ size: "sm" })}>
                          Request a Quote
                        </Link>
                      </div>
                    </div>

                    {/* Features / Includes + Meta */}
                    <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x">
                      {/* What's Included */}
                      {featureItems.length > 0 && (
                        <div className="md:col-span-2 p-8">
                          <h3 className="text-base font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                            What&apos;s Included
                          </h3>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {featureItems.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timeline & Ideal For sidebar */}
                      {(service.timeline || service.idealFor) && (
                        <div className="p-8 bg-muted/30 space-y-6">
                          {service.timeline && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                                Typical Timeline
                              </span>
                              <p className="font-medium">{service.timeline}</p>
                            </div>
                          )}
                          {service.idealFor && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                                Ideal For
                              </span>
                              <p className="font-medium">{service.idealFor}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-20 rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to build something great?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Tell us about your project and we&apos;ll get back to you within 24 hours with a tailored proposal.
            </p>
            <Link href="/contact" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
