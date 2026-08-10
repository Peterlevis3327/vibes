export const revalidate = 60;

import { Metadata } from "next";
import Link from "next/link";
import { getPortfolioProjects } from "@/lib/firebase/db";

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
  const allProjects = await getPortfolioProjects();
  
  // Extract unique categories from projects
  const availableCategories = Array.from(new Set(allProjects.map((p: any) => p.category).filter(Boolean))) as string[];
  const categories = ["All Projects", ...availableCategories];

  const projects = selectedCategory === "All Projects" 
    ? allProjects 
    : allProjects.filter((p: any) => p.category === selectedCategory);
  return (
    <div className="flex flex-col w-full">
      <section className="px-4 md:px-8 py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Our Work</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A selection of recent projects where we've helped ambitious companies launch and scale their digital products.
          </p>
        </div>
      </section>

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
              {projects.map((project, i) => (
                <div key={project.id} className={`group cursor-pointer ${i % 2 !== 0 ? 'md:mt-24' : ''}`}>
                  <Link key={project.id} href={`/portfolio/${project.id}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted mb-6 border">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {project.images?.[0]?.url ? (
                        <Image src={project.images[0].url} alt={project.images[0].alt || project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          <Briefcase className="h-24 w-24" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                    </div>
                    <p className="text-muted-foreground font-medium mb-3">{project.category} &middot; {project.year}</p>
                    <p className="text-foreground/80 line-clamp-2">{project.description}</p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
