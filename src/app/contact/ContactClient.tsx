"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
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
    
    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      toast.error(result.error || "An error occurred during submission.");
    }
  };

  return (
    <div className="flex flex-col w-full font-sans">
      <PageHeader 
        title={pageData?.title ?? "Let's build something."}
        subtitle={pageData?.subtitle ?? "Whether you have a clear vision or just a rough idea, we're here to help you bring it to life."}
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
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-muted/80">
          <p>hello@agency.com</p>
          <p className="hidden sm:block">•</p>
          <p>+1 (555) 123-4567</p>
        </div>
        
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <Label htmlFor="budget">Budget Range (Optional)</Label>
                    <Select name="budget">
                      <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10k-25k">$10k - $25k</SelectItem>
                        <SelectItem value="25k-50k">$25k - $50k</SelectItem>
                        <SelectItem value="50k+">$50k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
