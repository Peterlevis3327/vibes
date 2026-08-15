"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";
import { toast } from "sonner";import { PageHeader } from "@/components/layout/PageHeader";

interface ContactClientProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
  pageData?: any;
}

export default function ContactClient({ whatsappNumber, whatsappMessage, pageData }: ContactClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append("subject", "New Contact Form Submission");
      formData.append("from_name", "Tech254 Portfolio Contact Form");

      // 1. Submit to Server Action (which handles honeypot and rate limiting)
      const result = await submitContactForm(formData);

      if (result.success && result.accessKey) {
        // 2. Client-side Web3Forms submission
        // Bypasses Cloudflare WAF server-blocks, because we are sending from a real browser.
        formData.append("access_key", result.accessKey);
        const objectData = Object.fromEntries(formData.entries());
        const jsonBody = JSON.stringify(objectData);

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: jsonBody
        });

        const web3Result = await response.json();
        
        if (web3Result.success) {
          toast.success(web3Result.message || "Message sent! We'll get back to you shortly.");
          setSubmitted(true);
          form.reset();
        } else {
          toast.error(web3Result.message || "Failed to send message via Web3Forms.");
        }
      } else if (result.success && !result.accessKey) {
        // Honeypot triggered silently (returns success but no accessKey)
        toast.success(result.message || "Message sent! We'll get back to you shortly.");
        setSubmitted(true);
        form.reset();
      } else {
        const errorMsg = result.message || "An error occurred during submission.";
        console.error("Contact form error:", errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Unexpected contact form error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full font-sans">
      <PageHeader 
        title={pageData?.title ?? ""}
        subtitle={pageData?.subtitle ?? ""}
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
      >
        {(pageData?.email || pageData?.phone) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
            {pageData?.email && (
              <a
                href={`mailto:${pageData.email}`}
                aria-label={`Email: ${pageData.email}`}
                title={pageData.email}
                className={buttonVariants({ variant: "secondary", size: "icon", className: "h-11 w-11 rounded-full" })}
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
            {pageData?.phone && (
              <a
                href={`tel:${pageData.phone}`}
                aria-label={`Call: ${pageData.phone}`}
                title={pageData.phone}
                className={buttonVariants({ variant: "secondary", size: "icon", className: "h-11 w-11 rounded-full" })}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
        
        {whatsappNumber && whatsappMessage && (
          <div className="mt-8 flex justify-center relative z-10">
            <a 
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={buttonVariants({ variant: "secondary", className: "gap-2" })}
            >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
            </a>
          </div>
        )}
      </PageHeader>

      <section className="px-4 md:px-8 py-20 bg-background">
        <div className="container mx-auto max-w-2xl">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg className=" w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold">Message received.</h2>
              <p className="text-muted-foreground text-lg max-w-sm">
                Thank you for reaching out. We'll get back to you within 24 hours to discuss your project.
              </p>
              <Button className="mt-8" onClick={() => setSubmitted(false)} variant="outline">
                Send another message
              </Button>
            </div>
          ) : (
            <div className="bg-muted/30 p-8 md:p-12 rounded-3xl border">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="Jane Doe" className="h-12 bg-background" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required placeholder="jane@example.com" className="h-12 bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select name="projectType" required>
                    <SelectTrigger className="h-12 bg-background">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website Development</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="unsure">Not Sure / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Project Details</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    required 
                    placeholder="Tell us a bit about your goals, timeline, and current challenges..." 
                    className="min-h-[150px] resize-none bg-background"
                  />
                </div>

                {/* Honeypot field for spam prevention */}
                <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

                <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
