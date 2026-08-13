

import { Metadata } from "next";
import Link from "next/link";
import { getPortfolioProjects, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Portfolio & Case Studies | Agency.",
  description: "Explore our recent digital products, websites, and mobile applications.",
};
import { Briefcase } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";

// Mock data - will be replaced with Firestore data
export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const selectedCategory = params.category || "All Projects";
  const [allProjects, pageData] = await Promise.all([
    getPortfolioProjects(),
    getPageData("portfolio")
  ]);
  
  // Extract unique categories from projects
  const availableCategories = Array.from(new Set(allProjects.map((p: any) => p.category).filter(Boolean))) as string[];
  const categories = ["All Projects", ...availableCategories];

  const projects = selectedCategory === "All Projects" 
    ? allProjects 
    : allProjects.filter((p: any) => p.category === selectedCategory);
  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title={pageData?.title || "Our Work"}
        subtitle={pageData?.subtitle || "A selection of recent projects where we've helped ambitious companies launch and scale their digital products."}
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
        <div className="container mx-auto max-w-6xl">
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map(cat => {
              const isActive = cat === selectedCategory;
              return (
                <Link 
                  key={cat} 
                  href={cat === "All Projects" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(cat)}`}
                  scroll={false}
                  className={buttonVariants({ 
                    variant: isActive ? "secondary" : "ghost",
                    className: "rounded-full" 
                  })}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-24 border rounded-3xl bg-card">
              <h2 className="text-2xl font-bold mb-3">Portfolio Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently uploading our latest case studies. Check back soon to see our work in action.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
              {projects.map((project: any, i: number) => {
                const isMobile = project.category?.toLowerCase().includes('mobile');
                return (
                <div key={project.id} className={`group cursor-pointer ${i % 2 !== 0 ? 'md:mt-24' : ''}`}>
                  <Link href={`/portfolio/${project.id}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted mb-6 border flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      {(() => {
                        const imgSrc = project.thumbnailImage?.url || project.coverImage?.url || project.images?.[0]?.url;
                        const imgAlt = project.thumbnailImage?.alt || project.coverImage?.alt || project.images?.[0]?.alt || project.title;
                        return imgSrc ? (
                          <Image 
                            src={imgSrc} 
                            alt={imgAlt} 
                            fill 
                            className={`${isMobile ? 'object-contain p-6 sm:p-10 drop-shadow-2xl' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`} 
                            sizes="(max-width: 768px) 100vw, 50vw" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                            <Briefcase className="h-24 w-24" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                    </div>
                    <p className="text-muted-foreground font-medium mb-3">{project.category} &middot; {project.year}</p>
                    <p className="text-foreground/80 line-clamp-2">{project.description}</p>
                  </Link>
                </div>
              )})}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
