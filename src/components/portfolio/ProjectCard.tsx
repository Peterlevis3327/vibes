import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";

export function ProjectCard({ project }: { project: any }) {
  const isMobile = project.category?.toLowerCase().includes('mobile');
  const imgSrc = project.thumbnailImage?.url || project.coverImage?.url || project.images?.[0]?.url;
  const imgAlt = project.thumbnailImage?.alt || project.coverImage?.alt || project.images?.[0]?.alt || project.title;

  return (
    <Link href={`/portfolio/${project.id || project}`} className="group block">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted mb-6 border flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        {imgSrc ? (
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
        )}
      </div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{project.title || `Client Project ${project}`}</h3>
      </div>
      <p className="text-muted-foreground font-medium mb-3">{project.category || "Web Platform"} &middot; {project.year || "2024"}</p>
      {project.description && (
        <p className="text-foreground/80 leading-relaxed">{project.description}</p>
      )}
    </Link>
  );
}
