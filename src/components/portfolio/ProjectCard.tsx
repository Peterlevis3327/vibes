"use client";

import Link from "next/link";
import Image from "next/image";
import { Briefcase, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  project: any;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isMobile = project.category?.toLowerCase().includes('mobile');
  const imgSrc = project.thumbnailImage?.url || project.coverImage?.url || project.images?.[0]?.url;
  const imgAlt = project.thumbnailImage?.alt || project.coverImage?.alt || project.images?.[0]?.alt || project.title;

  return (
    <Link href={`/portfolio/${project.id || project}`} className="group flex flex-col h-full block">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted mb-6 border flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        {imgSrc ? (
          <Image 
            src={imgSrc} 
            alt={imgAlt} 
            fill 
            className={`${isMobile ? 'object-contain p-6 sm:p-10 drop-shadow-2xl' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`} 
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <Briefcase className="h-24 w-24" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start mb-2 gap-4">
        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
          {project.title || `Client Project ${project}`}
        </h3>
        {project.liveLink && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(project.liveLink, '_blank', 'noopener,noreferrer');
            }}
            className="shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center rounded-full w-10 h-10 transition-colors pointer-events-auto shadow-sm"
            title="Visit Live Site"
          >
            <ExternalLink className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <p className="text-muted-foreground font-medium mb-3 shrink-0">
        {project.category || "Web Platform"} &middot; {project.year || "2024"}
      </p>
      
      {project.description && (
        <p className="text-foreground/80 leading-relaxed line-clamp-3">
          {project.description}
        </p>
      )}
    </Link>
  );
}
