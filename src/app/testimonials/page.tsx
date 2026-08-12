

import { Metadata } from "next";
import { Quote } from "lucide-react";
import { getTestimonials, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Testimonials | Agency.",
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
        title={pageData?.title || "Client Testimonials"}
        subtitle={pageData?.subtitle || "Don't just take our word for it. Here's what our partners have to say about working with us."}
        backgroundImage={pageData?.headerBackgroundImage}
        backgroundImageVisibility={pageData?.backgroundImageVisibility}
      />

      <section className="px-4 md:px-8 py-24">
        <div className="container mx-auto max-w-6xl">
          {testimonials.length === 0 ? (
            <div className="text-center py-24 border rounded-3xl bg-card">
              <h2 className="text-2xl font-bold mb-3">No Testimonials Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're gathering feedback from our recent clients. Check back soon to hear about their experiences working with us.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any, i) => (
                <div key={testimonial.id || i} className="bg-muted/30 p-8 rounded-3xl border flex flex-col h-full relative group">
                  <Quote className="h-10 w-10 text-primary/20 mb-6" />
                  <p className="text-lg leading-relaxed flex-1 mb-8">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-muted-foreground/30 relative overflow-hidden">
                        {testimonial.avatar?.url ? (
                          <Image src={testimonial.avatar.url} alt={testimonial.avatar.alt || testimonial.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="text-xs">Photo</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ''}</p>
                      </div>
                    </div>
                    {testimonial.avatar?.showCaption && testimonial.avatar?.caption && (
                      <p className="text-xs text-muted-foreground mt-2 italic ml-16">
                        {testimonial.avatar.caption}
                      </p>
                    )}
                    {testimonial.relatedProjectId && (
                      <div className="pt-4 border-t mt-2">
                        <a href={`/portfolio/${testimonial.relatedProjectId}`} className="text-sm font-medium text-primary hover:underline">
                          Read Case Study &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
