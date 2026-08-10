"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Code, Smartphone, Briefcase, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
};

export default function HomeClient({ data, services = [], portfolio = [], faqs = [] }: { data: any, services: any[], portfolio: any[], faqs?: any[] }) {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative px-4 md:px-8 pt-24 pb-32 md:pt-32 md:pb-40 flex flex-col items-center text-center overflow-hidden">
        {/* Removed radial gradient for a cleaner editorial look */}
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            {data.availabilityBadge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
            {data.heroHeadline.includes("drive results.") ? (
              <>We design and build products that <span className="text-muted-foreground">drive results.</span></>
            ) : (
              data.heroHeadline
            )}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
            {data.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "text-base px-8 h-12" })}>
              {data.primaryCtaText} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/portfolio" className={buttonVariants({ size: "lg", variant: "outline", className: "text-base px-8 h-12" })}>
              {data.secondaryCtaText}
            </Link>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div 
          className="w-full max-w-5xl mx-auto mt-24 pt-12 border-t grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-3xl font-bold">50+</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Projects Delivered</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-3xl font-bold">10</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Years Experience</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-3xl font-bold">98%</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Client Retention</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-3xl font-bold">24/7</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Support Available</p>
          </div>
        </motion.div>
      </section>

      {/* Services Overview */}
      <section className="px-4 md:px-8 py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6" {...fadeUp}>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Capabilities</h2>
              <p className="text-lg text-muted-foreground">We focus on what we do best: building exceptional digital products from scratch.</p>
            </div>
            <Link href="/services" className={buttonVariants({ variant: "ghost", className: "group" })}>
              View all services <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {services.length === 0 ? (
            <div className="text-center py-20 border rounded-3xl bg-card">
              <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Our service offerings are currently being updated. Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {services.slice(0, 4).map((service: any, i: number) => (
                <motion.div key={service.id || i} variants={fadeUp} className="group grid md:grid-cols-2 gap-8 items-center">
                  <div className={`space-y-6 ${i % 2 !== 0 ? 'md:order-last' : ''}`}>
                    <h3 className="text-3xl font-bold tracking-tight">{service.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md">{service.shortDescription || service.desc}</p>
                    <Link href="/services" className="inline-flex items-center font-medium hover:text-primary transition-colors">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden relative border">
                    {service.screenshotImage?.url ? (
                      <Image src={service.screenshotImage.url} alt={service.screenshotImage.alt || service.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                        <span className="text-sm font-medium uppercase tracking-widest">[ Device Mockup ]</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Work */}
      <section className="px-4 md:px-8 py-32">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="mb-16" {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Selected Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">A glimpse into our recent partnerships and the results we've delivered.</p>
          </motion.div>

          {portfolio.length === 0 ? (
            <div className="text-center py-20 border rounded-3xl bg-card">
              <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Our project portfolio is currently being updated. Please check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {portfolio.slice(0, 4).map((item: any, i: number) => (
                <motion.div 
                  key={item.id || i} 
                  className={`group cursor-pointer ${i % 2 !== 0 ? 'md:mt-16' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/portfolio/${item.id || item}`} className="block">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted mb-6 border">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {item.images?.[0]?.url ? (
                        <Image src={item.images[0].url} alt={item.images[0].alt || item.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          <Briefcase className="h-24 w-24" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title || `Client Project ${item}`}</h3>
                    <p className="text-muted-foreground">{item.category || "Web Platform"} &middot; {item.year || "2024"}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div className="mt-20 text-center" {...fadeUp}>
            <Link href="/portfolio" className={buttonVariants({ size: "lg", variant: "outline", className: "rounded-full px-8" })}>
              Explore all projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Process Teaser */}
      <section className="px-4 md:px-8 py-24 bg-foreground text-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="grid md:grid-cols-2 gap-16 items-center" initial="initial" whileInView="whileInView" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">How we work</h2>
              <p className="text-lg text-muted/80 mb-8 leading-relaxed">
                We don't believe in black boxes. Our process is transparent, collaborative, and designed to eliminate surprises while maximizing impact.
              </p>
              <Link href="/process" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                View our full process
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="space-y-8">
              {[
                { num: "01", title: "Discovery", desc: "Understanding your business, audience, and goals." },
                { num: "02", title: "Design", desc: "Crafting intuitive, beautiful interfaces that align with your brand." },
                { num: "03", title: "Development", desc: "Writing clean, scalable code to bring the designs to life." },
                { num: "04", title: "Launch", desc: "Rigorous testing and a smooth deployment to production." }
              ].map((step) => (
                <div key={step.num} className="flex gap-6 border-b border-background/20 pb-8 last:border-0 last:pb-0">
                  <span className="text-3xl font-light text-muted/50">{step.num}</span>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                    <p className="text-muted/80">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="px-4 md:px-8 py-24 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <motion.div className="text-center mb-12" {...fadeUp}>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Everything you need to know about working with us.</p>
            </motion.div>

            <motion.div {...fadeUp} className="bg-background rounded-3xl p-6 md:p-8 border">
              <Accordion className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={faq.id || i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="px-4 md:px-8 py-32 text-center">
        <motion.div className="max-w-3xl mx-auto space-y-8" {...fadeUp}>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">Ready to build something extraordinary?</h2>
          <p className="text-xl text-muted-foreground text-balance">Let's discuss how we can help your business achieve its goals through exceptional digital products.</p>
          <div className="pt-8">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "text-lg px-10 h-14 rounded-full" })}>
              Start a Conversation
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
