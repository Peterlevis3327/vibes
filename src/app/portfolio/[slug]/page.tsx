

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Quote } from "lucide-react";
import { getProjectBySlug, getTestimonials } from "@/lib/firebase/db";
import { getLinkPreview } from "@/lib/utils/linkPreview";
import { LinkPreviewCard } from "@/components/ui/LinkPreviewCard";
import { notFound } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import ProjectGallery from "./ProjectGallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project?.seoTitle || `${project?.title || slug} | Portfolio | Tech254`,
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
  
  const hasLiveLink = Boolean(project.liveLink && project.liveLink.trim());
  const linkPreview = hasLiveLink ? await getLinkPreview(project.liveLink.trim()) : null;

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
              {project.client?.trim() && (
                <div>
                  <span className="block text-xs mb-1">Client</span>
                  <span className="text-foreground">{project.client.trim()}</span>
                </div>
              )}
              {project.industry?.trim() && (
                <div>
                  <span className="block text-xs mb-1">Industry</span>
                  <span className="text-foreground">{project.industry.trim()}</span>
                </div>
              )}
              {project.category?.trim() && (
                <div>
                  <span className="block text-xs mb-1">Services</span>
                  <span className="text-foreground">{project.category.trim()}</span>
                </div>
              )}
              {project.year?.trim() && (
                <div>
                  <span className="block text-xs mb-1">Year</span>
                  <span className="text-foreground">{project.year.trim()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {(() => {
          const isMobile = project.category?.toLowerCase().includes('mobile');
          const imgSrc = project.coverImage?.url || project.images?.[0]?.url;
          const imgAlt = project.coverImage?.alt || project.images?.[0]?.alt || project.title;
          
          return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-24">
              {isMobile ? (
                // Mobile Device Mockup
                <div className="relative w-full max-w-sm mx-auto flex flex-col">
                  <div className="relative aspect-[9/19] w-full rounded-[3rem] border-[14px] border-foreground/90 bg-foreground/90 shadow-2xl overflow-hidden ring-1 ring-border/20">
                    {/* Top Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20 pointer-events-none">
                      <div className="w-32 h-6 bg-foreground/90 rounded-b-3xl"></div>
                    </div>
                    {/* Screen Content */}
                    <div className="relative w-full h-full bg-background overflow-hidden rounded-[2rem]">
                      {imgSrc ? (
                        <Image 
                          src={imgSrc} 
                          alt={imgAlt} 
                          fill 
                          className="object-cover" 
                          priority 
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <span>Mobile Mockup</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Web Browser Mockup
                <div className="relative w-full rounded-2xl md:rounded-3xl border shadow-xl bg-card overflow-hidden flex flex-col">
                  {/* Browser Chrome */}
                  <div className="h-10 border-b bg-muted/50 flex items-center px-4 gap-2 relative z-20 flex-shrink-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="absolute inset-x-0 mx-auto flex justify-center pointer-events-none hidden sm:flex">
                      <div className="h-6 bg-background rounded-md border text-[10px] font-medium flex items-center px-6 text-muted-foreground justify-center shadow-sm max-w-[200px] truncate">
                        {project.title.toLowerCase().replace(/\s+/g, '')}.com
                      </div>
                    </div>
                  </div>
                  {/* Screen Content — fixed aspect ratio so image always fits */}
                  <div className="relative w-full aspect-[16/9] bg-muted/20">
                    {imgSrc ? (
                      <Image 
                        src={imgSrc} 
                        alt={imgAlt} 
                        fill 
                        className="object-contain object-top" 
                        priority 
                        sizes="100vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <span>Web Mockup</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {project.coverImage?.showCaption && project.coverImage?.caption && (
                <p className="text-center text-sm text-muted-foreground mt-8 italic w-full">
                  {project.coverImage.caption}
                </p>
              )}
            </div>
          );
        })()}

        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-24">
          {/* Content Sections — only render if non-empty content exists */}
          {project.description?.trim() && (
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
              <h2 className="text-2xl font-bold">Project Overview</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description.trim()}</p>
              </div>
            </div>
          )}

          {project.challenge?.trim() && (
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
              <h2 className="text-2xl font-bold">The Challenge</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.challenge.trim()}</p>
              </div>
            </div>
          )}

          {project.approach?.trim() && (
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
              <h2 className="text-2xl font-bold">The Approach</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.approach.trim()}</p>
              </div>
            </div>
          )}

          {project.outcome?.trim() && (
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t pt-12">
              <h2 className="text-2xl font-bold">The Outcome</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.outcome.trim()}</p>
              </div>
            </div>
          )}

          {project.galleryImages && project.galleryImages.length > 0 && (
            <ProjectGallery 
              images={project.galleryImages} 
              isMobile={project.category?.toLowerCase().includes('mobile')} 
            />
          )}

          {/* Tech Stack & Links */}
          {((project.techStack && project.techStack.length > 0) || project.liveLink?.trim()) && (
            <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
              {project.techStack && project.techStack.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-6">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.techStack.map((tech: string) => (
                      <span key={tech} className="px-4 py-2 bg-background border rounded-full text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {project.liveLink?.trim() && (
                <div className={project.techStack && project.techStack.length > 0 ? "mt-8 pt-8 border-t" : ""}>
                  <h3 className="text-xl font-bold mb-6">Live Project</h3>
                  {linkPreview ? (
                    <LinkPreviewCard
                      title={linkPreview.title || project.title}
                      description={linkPreview.description || project.description}
                      image={linkPreview.image}
                      url={project.liveLink.trim()}
                      domain={linkPreview.domain}
                    />
                  ) : (
                    <a 
                      href={project.liveLink.trim().startsWith('http://') || project.liveLink.trim().startsWith('https://') ? project.liveLink.trim() : `https://${project.liveLink.trim()}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={buttonVariants({ variant: "outline", size: "lg" })}
                    >
                      Visit Live Site <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {relatedTestimonial && (
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <Quote className="h-12 w-12 text-primary-foreground/20 absolute top-8 right-8" />
              <p className="text-xl md:text-2xl leading-relaxed mb-8 relative z-10 font-medium">
                "{relatedTestimonial.quote}"
              </p>
              <div className="flex flex-col gap-4 relative z-10">
                <div>
                  {(() => {
                    const clientName = relatedTestimonial.clientName || relatedTestimonial.name || "Client";
                    const clientRole = relatedTestimonial.clientRole || relatedTestimonial.role || "";
                    const clientCompany = relatedTestimonial.clientCompany || relatedTestimonial.company || "";
                    const roleAndCompany = [clientRole, clientCompany].filter(Boolean).join(", ");

                    return (
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                          {relatedTestimonial.avatar?.url ? (
                            <Image src={relatedTestimonial.avatar.url} alt={relatedTestimonial.avatar.alt || clientName} fill className="object-cover" sizes="48px" />
                          ) : (
                            <span className="text-xs">Photo</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold">{clientName}</h4>
                          {roleAndCompany && (
                            <p className="text-sm opacity-80">{roleAndCompany}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {relatedTestimonial.avatar?.showCaption && relatedTestimonial.avatar?.caption && (
                    <p className="text-xs text-primary-foreground/80 mt-3 italic ml-16">
                      {relatedTestimonial.avatar.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          

        </div>
      </article>
    </div>
  );
}
