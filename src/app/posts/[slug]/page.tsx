

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getPostBySlug } from "@/lib/firebase/db";
import { notFound } from "next/navigation";
import Image from "next/image";

import DOMPurify from 'isomorphic-dompurify';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.seoTitle || post?.title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: title.includes('|') ? title : `${title} | Insights | Agency.`,
    description: post?.seoDescription || post?.excerpt || `Read our latest article: ${title}.`,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const displayDate = post.date?.toDate 
    ? post.date.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
    : String(post.date || "");
    
  const cleanContent = DOMPurify.sanitize(post.content || "");

  return (
    <div className="flex flex-col w-full">
      <article className="pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/posts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to insights
          </Link>
          
          <header className="mb-16">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              <span className="text-primary">{post.category}</span>
              <span>&middot;</span>
              <span>{displayDate}</span>
              <span>&middot;</span>
              <span>By {post.author}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight">
              {post.title}
            </h1>
          </header>

          <div className="mb-16">
            <div className="aspect-video bg-muted rounded-3xl w-full flex items-center justify-center text-muted-foreground/30 relative overflow-hidden">
              {post.coverImage?.url ? (
                <Image src={post.coverImage.url} alt={post.coverImage.alt || post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
              ) : (
                <span>Cover Image</span>
              )}
            </div>
            {post.coverImage?.showCaption && post.coverImage?.caption && (
              <p className="text-center text-sm text-muted-foreground mt-4 italic">
                {post.coverImage.caption}
              </p>
            )}
          </div>

          <div 
            className="prose prose-lg md:prose-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </article>
    </div>
  );
}
