import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Quote } from "lucide-react";
import { getProjectBySlug, getTestimonials } from "@/lib/firebase/db";
import { getLinkPreview } from "@/lib/utils/linkPreview";
import { LinkPreviewCard } from "@/components/ui/LinkPreviewCard";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
                      fallbackImage={project.coverImage?.url || project.images?.[0]?.url || null}
                      domain={linkPreview.domain}
                      canEmbed={linkPreview.canEmbed}
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
