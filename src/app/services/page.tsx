

import { Metadata } from "next";
import { Code, Smartphone, PenTool, LayoutTemplate } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services | Agency.",
  description: "Explore our capabilities in web development, mobile apps, and UI/UX design.",
};
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { getServices, getPortfolioProjects, getPageData } from "@/lib/firebase/db";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServicesPage() {
  const [services, portfolio, pageData] = await Promise.all([
    getServices(),
    getPortfolioProjects(),
    getPageData("services")
  ]);
  
  // Sort services by order if it exists
  const sortedServices = [...services].sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title={pageData?.title || "Our Services"}
        subtitle={pageData?.subtitle || "Comprehensive digital solutions designed to help your business scale. From concept to deployment, we handle it all."}
        backgroundImage={pageData?.headerBackgroundImage}
        showBackgroundImage={pageData?.showBackgroundImage !== false}
      />

      <section className="px-4 md:px-8 py-24">
        <div className="container mx-auto max-w-5xl space-y-24">
          {sortedServices.length === 0 ? (
            <div className="text-center py-24 border rounded-3xl bg-card">
              <h2 className="text-2xl font-bold mb-3">Services Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently updating our service offerings. Check back soon for detailed information about our capabilities.
              </p>
            </div>
          ) : (
            sortedServices.map((service: any, index) => {
              const isMobile = service.category?.toLowerCase().includes('mobile');
              return (
              <div key={service.id || index} className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
                <div className="md:col-span-4 space-y-6 sticky top-24">
                  {service.screenshotImage?.url && (
                    <div>
                      <div className="relative h-24 w-24 rounded-2xl overflow-hidden border flex items-center justify-center bg-muted">
                        <Image 
                          src={service.screenshotImage.url} 
                          alt={service.screenshotImage.alt || service.title} 
                          fill 
                          className={isMobile ? "object-contain p-2" : "object-cover"} 
                          sizes="96px" 
                        />
                      </div>
                      {service.screenshotImage?.showCaption && service.screenshotImage?.caption && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          {service.screenshotImage.caption}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                    <p className="text-muted-foreground">{service.shortDescription || service.description || service.content}</p>
                  </div>
                  {(service.timeline || service.idealFor) && (
                    <div className="space-y-4 pt-4 border-t">
                      {service.timeline && (
                        <div>
                          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Typical Timeline</span>
                          <p className="font-medium">{service.timeline}</p>
                        </div>
                      )}
                      {service.idealFor && (
                        <div>
                          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ideal For</span>
                          <p className="font-medium">{service.idealFor}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <Link href="/contact" className={buttonVariants({ className: "w-full" })}>Request a Quote</Link>
                </div>
                <div className="md:col-span-8 bg-muted/30 rounded-3xl p-8 md:p-12">
                  {service.includes && service.includes.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold mb-6 border-b pb-4">What's Included</h3>
                      <ul className="space-y-4 mb-12">
                        {service.includes.map((item: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <LayoutTemplate className="h-5 w-5 text-primary mr-4 mt-0.5" />
                            <span className="font-medium text-lg">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <div className="pt-8 border-t">
                    <h3 className="text-xl font-bold mb-6">Recent Work</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {portfolio.slice(0, 2).map((item: any) => (
                        <Link key={item.id} href={`/portfolio/${item.id}`} className="block group">
                          <div className="aspect-[4/3] bg-background rounded-xl border border-muted flex items-center justify-center overflow-hidden relative mb-3">
                            {item.images?.[0]?.url ? (
                              <Image src={item.images[0].url} alt={item.images[0].alt || item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                            ) : (
                              <span className="text-muted-foreground">{item.title}</span>
                            )}
                          </div>
                          <h4 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h4>
                        </Link>
                      ))}
                      {portfolio.length === 0 && (
                        <p className="text-muted-foreground">No recent projects to show.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
