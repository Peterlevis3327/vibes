import { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPageData } from "@/lib/firebase/db";
import { Button, buttonVariants } from "@/components/ui/button";
import { getProcessSteps } from "@/lib/firebase/db";

export const metadata: Metadata = {
  title: "Our Process | Tech254",
  description: "Learn how we take digital products from ideation to launch.",
};

export default async function ProcessPage() {
  const [processSteps, pageData] = await Promise.all([
    getProcessSteps(),
    getPageData("process")
  ]);
  // Sort by order ascending
  const steps = processSteps.sort((a, b) => (a.order || 0) - (b.order || 0)).map((s, idx) => ({
    num: (idx + 1).toString().padStart(2, '0'),
    title: s.title,
    duration: s.duration || "N/A",
    desc: s.desc || "",
    deliverables: s.deliverables || []
  }));

  // Fallback to hardcoded if none exist yet
  const displaySteps = steps.length > 0 ? steps : [
    {
      num: "01",
      title: "Discovery & Scoping",
      duration: "1-2 Weeks",
      desc: "We start by deeply understanding your business, your users, and your goals. We define the project scope, technical requirements, and success metrics.",
      deliverables: ["Project Brief", "Technical Architecture Document", "Timeline & Milestones"]
    },
    {
      num: "02",
      title: "Design",
      duration: "2-4 Weeks",
      desc: "Crafting intuitive, beautiful interfaces that align with your brand. We prioritize user experience and aesthetic excellence to ensure your product stands out.",
      deliverables: ["Wireframes", "Interactive Prototypes", "Design System"]
    },
    {
      num: "03",
      title: "Development",
      duration: "4-8 Weeks",
      desc: "Writing clean, scalable code to bring the designs to life. We build robust architectures that perform seamlessly across all devices.",
      deliverables: ["Frontend Implementation", "Backend Integration", "CMS Setup"]
    },
    {
      num: "04",
      title: "Launch",
      duration: "1-2 Weeks",
      desc: "Rigorous testing and a smooth deployment to production. We ensure everything works perfectly before introducing your product to the world.",
      deliverables: ["QA Testing", "Performance Optimization", "Deployment"]
    }
  ];

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
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-16">
            {displaySteps.map((step, index) => (
              <div key={step.num} className="relative pl-8 md:pl-0">
                {/* Timeline Line */}
                <div className="hidden md:block absolute left-[120px] top-0 bottom-[-64px] w-px bg-border last:hidden"></div>
                
                <div className="grid md:grid-cols-[120px_1fr] gap-8 items-start relative z-10">
                  <div className="hidden md:flex h-16 w-16 rounded-full bg-muted border-4 border-background items-center justify-center -ml-[32px] text-xl font-bold text-muted-foreground">
                    {step.num}
                  </div>
                  
                  <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <h2 className="text-2xl md:text-3xl font-bold">
                        <span className="md:hidden text-primary mr-2">{step.num}.</span>
                        {step.title}
                      </h2>
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      {step.desc}
                    </p>
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Key Deliverables</h4>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {step.deliverables.map((item: any, i: number) => (
                          <li key={i} className="flex items-center text-sm font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-32 text-center bg-muted/30 p-12 rounded-3xl border">
            <h3 className="text-3xl font-bold mb-4">Ready to start the process?</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Every great project starts with a simple conversation. Let's talk about your goals and how we can help you achieve them.
            </p>
            <Link href="/contact" className={buttonVariants({ size: "lg" })}>Book a Discovery Call</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
