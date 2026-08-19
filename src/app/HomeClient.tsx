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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ProjectCard } from "@/components/portfolio/ProjectCard";


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
  const visibility = data.backgroundImageVisibility ?? 20;
  const overlayOpacity = 1 - (visibility / 100);

  const isMobile = useMediaQuery("(max-width: 767px)");

  // Resolve hero headline — use mobile override values on narrow viewports
  const headlineX = isMobile && data.heroHeadlineMobileOverride ? (data.heroHeadlineMobileX ?? 0) : (data.heroHeadlineX ?? 0);
  const headlineY = isMobile && data.heroHeadlineMobileOverride ? (data.heroHeadlineMobileY ?? 20) : (data.heroHeadlineY ?? 30);
  const headlineW = isMobile && data.heroHeadlineMobileOverride ? (data.heroHeadlineMobileWidth ?? 100) : (data.heroHeadlineWidth ?? 100);
  const headlineFs = isMobile && data.heroHeadlineMobileOverride ? data.heroHeadlineMobileFontSize : data.heroHeadlineFontSize;

  // Resolve hero subheadline
  const subX = isMobile && data.heroSubheadlineMobileOverride ? (data.heroSubheadlineMobileX ?? 0) : (data.heroSubheadlineX ?? 0);
  const subY = isMobile && data.heroSubheadlineMobileOverride ? (data.heroSubheadlineMobileY ?? 55) : (data.heroSubheadlineY ?? 60);
  const subW = isMobile && data.heroSubheadlineMobileOverride ? (data.heroSubheadlineMobileWidth ?? 100) : (data.heroSubheadlineWidth ?? 100);
  const subFs = isMobile && data.heroSubheadlineMobileOverride ? data.heroSubheadlineMobileFontSize : data.heroSubheadlineFontSize;

  const toClamp = (px?: number) => px ? `clamp(${Math.max(14, Math.round(px * 0.4))}px, ${(px / 16).toFixed(2)}vw + 1rem, ${px}px)` : undefined;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section 
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(300px, 40vw, 560px)' }}
      >
        {data.heroBackgroundImage?.url && (
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${data.heroBackgroundImage.url})` }} 
            />
            <div 
              className="absolute inset-0 bg-background z-0 transition-all duration-200"
              style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.7})` }}
            />
          </>
        )}
        {/* Removed radial gradient for a cleaner editorial look */}
        {/* Text Container */}
        <motion.div 
          className="absolute inset-0 z-10 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div 
            className="absolute"
            style={{ 
              left: `${headlineX}%`, 
              top: `${headlineY}%`,
              width: `${headlineW}%`,
              minWidth: '10%',
              minHeight: 'max-content',
              fontSize: toClamp(headlineFs),
            }}
          >
            <h1 
              className="font-bold tracking-tight text-balance leading-tight w-full text-center"
              style={{ color: data.heroHeadlineColor || 'var(--heading)' }}
            >
              {data.heroHeadline}
            </h1>
          </div>
          <div 
            className="absolute"
            style={{ 
              left: `${subX}%`, 
              top: `${subY}%`,
              width: `${subW}%`,
              minWidth: '10%',
              minHeight: 'max-content',
              fontSize: toClamp(subFs),
            }}
          >
            <p 
              className="w-full text-center text-balance"
              style={{ color: data.heroSubheadlineColor || 'var(--muted-foreground)' }}
            >
              {data.heroSubheadline}
            </p>
          </div>
        </motion.div>

        {/* Trust Signals */}
        {(data.trustSignal1Value || data.trustSignal2Value || data.trustSignal3Value || data.trustSignal4Value) && (
          <motion.div 
            className="w-full max-w-5xl mx-auto mt-24 pt-12 border-t grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {data.trustSignal1Value && (
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-3xl font-bold">{data.trustSignal1Value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{data.trustSignal1Label}</p>
              </div>
            )}
            {data.trustSignal2Value && (
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-3xl font-bold">{data.trustSignal2Value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{data.trustSignal2Label}</p>
              </div>
            )}
            {data.trustSignal3Value && (
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-3xl font-bold">{data.trustSignal3Value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{data.trustSignal3Label}</p>
              </div>
            )}
            {data.trustSignal4Value && (
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-3xl font-bold">{data.trustSignal4Value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{data.trustSignal4Label}</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Services Overview */}
      <section className="px-4 md:px-8 py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6" {...fadeUp}>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{data.capabilitiesTitle ?? "Capabilities"}</h2>
              <p className="text-lg text-muted-foreground">{data.capabilitiesDescription ?? "We focus on what we do best: building exceptional digital products from scratch."}</p>
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
              {services.slice(0, 4).map((service: any, i: number) => {
                const isMobile = service.category?.toLowerCase().includes('mobile');
                return (
                <motion.div key={service.id || i} variants={fadeUp} className="group grid md:grid-cols-2 gap-8 items-center">
                  <div className={`space-y-6 ${i % 2 !== 0 ? 'md:order-last' : ''}`}>
                    <h3 className="text-3xl font-bold tracking-tight">{service.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md">{service.shortDescription || service.desc}</p>
                    <Link href="/services" className="inline-flex items-center font-medium hover:text-primary transition-colors">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <div className={`aspect-[4/3] bg-muted rounded-2xl overflow-hidden relative border flex items-center justify-center ${isMobile ? '' : 'group-hover:border-primary/50 transition-colors'}`}>
                    {service.screenshotImage?.url ? (
                      <Image 
                        src={service.screenshotImage.url} 
                        alt={service.screenshotImage.alt || service.title} 
                        fill 
                        className={isMobile ? "object-contain p-6 sm:p-10 drop-shadow-2xl" : "object-cover group-hover:scale-105 transition-transform duration-500"} 
                        sizes="(max-width: 768px) 100vw, 50vw" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                        <span className="text-sm font-medium uppercase tracking-widest">[ Device Mockup ]</span>
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Work */}
      <section className="px-4 md:px-8 py-32">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="mb-16" {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{data.selectedWorkTitle ?? "Selected Work"}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">{data.selectedWorkDescription ?? "A glimpse into our recent partnerships and the results we've delivered."}</p>
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
                  className={`cursor-pointer ${i % 2 !== 0 ? 'md:mt-16' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <ProjectCard project={item} />
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{data.processTitle ?? "How we work"}</h2>
              <p className="text-lg text-muted/80 mb-8 leading-relaxed">
                {data.processDescription ?? "We don't believe in black boxes. Our process is transparent, collaborative, and designed to eliminate surprises while maximizing impact."}
              </p>
              <Link href="/process" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                View our full process
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="space-y-8">
              {[
                { num: "01", title: data.processStep1Title ?? "Discovery", desc: data.processStep1Description ?? "Understanding your business, audience, and goals." },
                { num: "02", title: data.processStep2Title ?? "Design", desc: data.processStep2Description ?? "Crafting intuitive, beautiful interfaces that align with your brand." },
                { num: "03", title: data.processStep3Title ?? "Development", desc: data.processStep3Description ?? "Writing clean, scalable code to bring the designs to life." },
                { num: "04", title: data.processStep4Title ?? "Launch", desc: data.processStep4Description ?? "Rigorous testing and a smooth deployment to production." }
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{data.faqTitle ?? "Frequently Asked Questions"}</h2>
              <p className="text-lg text-muted-foreground">{data.faqDescription ?? "Everything you need to know about working with us."}</p>
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
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">{data.ctaTitle ?? "Ready to build something extraordinary?"}</h2>
          <p className="text-xl text-muted-foreground text-balance">{data.ctaDescription ?? "Let's discuss how we can help your business achieve its goals through exceptional digital products."}</p>
          <div className="pt-8">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "text-lg px-10 h-14 rounded-full" })}>
              {data.ctaButtonText ?? "Start a Conversation"}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
