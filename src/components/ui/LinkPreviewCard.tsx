import { ExternalLink } from "lucide-react";

interface LinkPreviewCardProps {
  title: string;
  description?: string | null;
  image?: string | null;
  url: string;
  domain: string;
}

export function LinkPreviewCard({ title, description, image, url, domain }: LinkPreviewCardProps) {
  const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground transition-all hover:border-primary/50 hover:shadow-md max-w-2xl"
    >
      <div className="flex flex-col sm:flex-row h-full">
        {image && (
          <div className="relative aspect-video sm:aspect-square sm:w-48 flex-shrink-0 bg-muted overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title || "Link preview"}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col justify-between p-6 flex-1">
          <div className="space-y-2">
            <h4 className="font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors text-lg">
              {title}
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground tracking-wider">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            {domain}
          </div>
        </div>
      </div>
    </a>
  );
}
