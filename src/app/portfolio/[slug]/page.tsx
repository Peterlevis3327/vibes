

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Quote } from "lucide-react";
import { getProjectBySlug, getTestimonials } from "@/lib/firebase/db";
import { notFound } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project?.seoTitle || `${project?.title || slug} | Portfolio | Agency.`,
    description: project?.seoDescription || project?.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const project = await getProjectBySlug(slug);
  
  if (!project) {
    notFound();
  }

  const allTestimonials = await getTestimonials();
  const relatedTestimonial = allTestimonials.find((t: any) => t.relatedProjectId === project.id);

  return (
    <div className="flex flex-col w-full">
      <article className="pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <Link href="/portfolio" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all projects
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{project.title}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <div>
                <span className="block text-xs mb-1">Client</span>
                <span className="text-foreground">{project.client}</span>
              </div>
              <div>
                <span className="block text-xs mb-1">Industry</span>
                <span className="text-foreground">{project.industry}</span>
              </div>
              <div>
                <span className="block text-xs mb-1">Services</span>
                <span className="text-foreground">{project.category}</span>
              </div>
              <div>
                <span className="block text-xs mb-1">Year</span>
                <span className="text-foreground">{project.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-24">
          <div className="aspect-video bg-muted rounded-3xl w-full flex items-center justify-center text-muted-foreground/30 relative overflow-hidden">
            {(project.coverImage?.url || project.images?.[0]?.url) ? (
              <Image 
                src={project.coverImage?.url || project.images[0].url} 
                alt={project.coverImage?.alt || project.images?.[0]?.alt || project.title} 
                fill 
                className="object-cover" 
                priority 
              />
            ) : (
              <span>Primary Project Image / Device Mockup</span>
            )}
          </div>
          {project.coverImage?.showCaption && project.coverImage?.caption && (
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              {project.coverImage.caption}
            </p>
          )}
        </div>

        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-24">
          {/* Content Sections */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
            <h2 className="text-2xl font-bold">The Challenge</h2>
            <div className="prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">{project.challenge}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
            <h2 className="text-2xl font-bold">The Approach</h2>
            <div className="prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">{project.approach}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
            <h2 className="text-2xl font-bold">The Outcome</h2>
            <div className="prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">{project.outcome}</p>
            </div>
          </div>

          {/* Tech Stack & Links */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
            <h3 className="text-xl font-bold mb-6">Technologies Used</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {project.techStack?.map((tech: string) => (
                <span key={tech} className="px-4 py-2 bg-background border rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
                  Visit Live Site <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            )}
          </div>

          {relatedTestimonial && (
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <Quote className="h-12 w-12 text-primary-foreground/20 absolute top-8 right-8" />
              <p className="text-xl md:text-2xl leading-relaxed mb-8 relative z-10 font-medium">
                "{relatedTestimonial.quote}"
              </p>
              <div className="flex flex-col gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                      {relatedTestimonial.avatar?.url ? (
                        <Image src={relatedTestimonial.avatar.url} alt={relatedTestimonial.avatar.alt || relatedTestimonial.name} fill className="object-cover" />
                      ) : (
                        <span className="text-xs">Photo</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{relatedTestimonial.name}</h4>
                      <p className="text-sm opacity-80">{relatedTestimonial.role}{relatedTestimonial.company ? `, ${relatedTestimonial.company}` : ''}</p>
                    </div>
                  </div>
                  {relatedTestimonial.avatar?.showCaption && relatedTestimonial.avatar?.caption && (
                    <p className="text-xs text-primary-foreground/80 mt-3 italic ml-16">
                      {relatedTestimonial.avatar.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Next Project Nav */}
          <div className="border-t pt-12 flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider block mb-2">Previous Project</span>
              <Link href="#" className="text-xl font-bold hover:text-primary transition-colors">Health & Wellness Tracker</Link>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider block mb-2">Next Project</span>
              <Link href="#" className="text-xl font-bold hover:text-primary transition-colors">Global E-commerce</Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
