"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

interface LinkPreviewCardProps {
  title: string;
  description?: string | null;
  image?: string | null;
  fallbackImage?: string | null;
  url: string;
  domain: string;
  canEmbed?: boolean;
}

const DESKTOP_VIEWPORT_WIDTH = 1280;
const DESKTOP_VIEWPORT_HEIGHT = 800;

export function LinkPreviewCard({
  title,
  description,
  image,
  fallbackImage,
  url,
  domain,
  canEmbed = false,
}: LinkPreviewCardProps) {
  const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  const [viewMode, setViewMode] = useState<"live" | "card">(canEmbed ? "live" : "card");
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(image || fallbackImage || null);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImage(image || fallbackImage || null);
  }, [image, fallbackImage]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || viewMode !== "live") return;

    const updateWidth = () => {
      setContainerWidth(el.clientWidth);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode]);

  const handleImageError = () => {
    if (activeImage && fallbackImage && activeImage !== fallbackImage) {
      setActiveImage(fallbackImage);
    } else {
      setActiveImage(null);
    }
  };

  if (viewMode === "live") {
    const useDesktopScale = containerWidth !== null && containerWidth >= 540;
    const scale = useDesktopScale ? containerWidth / DESKTOP_VIEWPORT_WIDTH : 1;

    return (
      <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
        {/* Browser Chrome */}
        <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2.5">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="flex max-w-xs items-center gap-1.5 truncate rounded-md border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{domain}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Summary
            </button>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Visit <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Live Landing Page Viewport */}
        <div
          ref={viewportRef}
          className={`relative w-full overflow-hidden bg-white ${
            containerWidth !== null && containerWidth < 540 ? "h-[460px]" : "aspect-[16/10]"
          }`}
        >
          {!frameLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/30 text-sm text-muted-foreground">
              <Globe className="h-5 w-5 animate-pulse" />
              <span>Loading live landing page...</span>
            </div>
          )}

          {containerWidth !== null && (
            <iframe
              src={href}
              title={`${title} live landing page preview`}
              loading="lazy"
              onLoad={() => setFrameLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              style={
                useDesktopScale
                  ? {
                      width: `${DESKTOP_VIEWPORT_WIDTH}px`,
                      height: `${DESKTOP_VIEWPORT_HEIGHT}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }
                  : undefined
              }
              className={`border-0 bg-white transition-opacity duration-300 ${
                useDesktopScale ? "block" : "h-full w-full"
              } ${frameLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t bg-muted/20 px-5 py-4">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
            )}
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-primary hover:underline flex-shrink-0"
          >
            Open in new tab <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground transition-all hover:border-primary/50 hover:shadow-md max-w-2xl"
      >
        <div className="flex flex-col sm:flex-row h-full">
          {activeImage && (
            <div className="relative aspect-video sm:aspect-square sm:w-48 flex-shrink-0 bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={title || "Link preview"}
                onError={handleImageError}
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

      {canEmbed && (
        <button
          type="button"
          onClick={() => setViewMode("live")}
          className="text-xs font-medium text-primary hover:underline"
        >
          Switch back to Live Page Preview
        </button>
      )}
    </div>
  );
}
