

import { Metadata } from "next";
import Link from "next/link";
import { getPosts, getPageData } from "@/lib/firebase/db";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Insights & Blog | Agency.",
  description: "Read our latest thoughts on design, engineering, and digital products.",
};
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const selectedCategory = params.category || "All Insights";
  const [allPosts, pageData] = await Promise.all([
    getPosts(),
    getPageData("posts")
  ]);
  
  // Extract unique categories
  const availableCategories = Array.from(new Set(allPosts.map((p: any) => p.category).filter(Boolean))) as string[];
  const categories = ["All Insights", ...availableCategories];

  const posts = selectedCategory === "All Insights"
    ? allPosts
    : allPosts.filter((p: any) => p.category === selectedCategory);
  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title={pageData?.title || "Insights"}
        subtitle={pageData?.subtitle || "Thoughts, learnings, and strategies on product design, software engineering, and growing digital businesses."}
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
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map(cat => {
              const isActive = cat === selectedCategory;
              return (
                <Link 
                  key={cat} 
                  href={cat === "All Insights" ? "/posts" : `/posts?category=${encodeURIComponent(cat)}`}
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

          {posts.length === 0 ? (
            <div className="text-center py-24 border rounded-3xl bg-card">
              <h2 className="text-2xl font-bold mb-3">No Insights Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently working on our first set of articles and insights. Check back soon for thoughts on design, engineering, and product strategy.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-16">
                {posts.map((post: any) => (
                  <article key={post.id} className="group border-b pb-16 last:border-0 last:pb-0">
                    <Link href={`/posts/${post.id}`} className="group block">
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        <span className="text-primary">{post.category}</span>
                        <span>&middot;</span>
                        <span>{post.date}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-primary font-medium">
                        Read Article <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              <div className="mt-24 text-center">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  Load More Articles
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
