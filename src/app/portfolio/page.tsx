

import { Metadata } from "next";
import Link from "next/link";
import { getPortfolioProjects, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Portfolio & Case Studies | Tech254",
  description: "Explore our recent digital products, websites, and mobile applications.",
};
import { Briefcase } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

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
              {projects.map((project: any, i: number) => (
                <div key={project.id} className={`${i % 2 !== 0 ? 'md:mt-24' : ''}`}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
