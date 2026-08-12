"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryImage = {
  url: string;
  alt: string;
  caption?: string;
  showCaption?: boolean;
};

export default function ProjectGallery({ images, isMobile }: { images: GalleryImage[], isMobile: boolean }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLightboxIndex(index);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
    }
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="pt-16 pb-8 border-t mt-12">
        <h2 className="text-2xl font-bold mb-8">Project Gallery</h2>
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {images.map((img, i) => (
            <div 
              key={i} 
              role="button"
              tabIndex={0}
              className="cursor-pointer group relative overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setLightboxIndex(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              aria-label={`View image ${i + 1} of ${images.length} in fullscreen`}
            >
              {isMobile ? (
                <div className="relative w-full max-w-[280px] mx-auto flex flex-col transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="relative aspect-[9/19] w-full rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-xl overflow-hidden ring-1 ring-border/20">
                    <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20 pointer-events-none">
                      <div className="w-24 h-5 bg-foreground/90 rounded-b-2xl"></div>
                    </div>
                    <div className="relative w-full h-full bg-background overflow-hidden rounded-[1.7rem]">
                      <Image 
                        src={img.url} 
                        alt={img.alt} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[16/10] rounded-2xl border bg-muted/20 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] shadow-sm group-hover:shadow-md">
                  <Image 
                    src={img.url} 
                    alt={img.alt} 
                    fill 
                    className="object-cover object-top" 
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}
              {img.showCaption && img.caption && (
                <p className="text-center text-xs text-muted-foreground mt-4 italic">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent className="max-w-[100vw] w-full max-h-[100vh] h-[100dvh] p-0 border-none bg-black/95 shadow-none flex flex-col justify-center items-center rounded-none sm:rounded-none">
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 z-50 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 z-50 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {lightboxIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
              <div className="relative w-full h-full">
                <Image 
                  src={images[lightboxIndex].url}
                  alt={images[lightboxIndex].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  quality={100}
                  priority
                />
              </div>
              {images[lightboxIndex].showCaption && images[lightboxIndex].caption && (
                <div className="absolute bottom-6 sm:bottom-12 inset-x-0 mx-auto text-center z-50 px-4">
                  <span className="bg-black/80 text-white text-sm px-6 py-3 rounded-full backdrop-blur-md inline-block max-w-2xl shadow-xl border border-white/10">
                    {images[lightboxIndex].caption}
                  </span>
                </div>
              )}
              
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-6 left-6 z-50 text-white/70 text-sm font-medium tracking-widest uppercase">
                  {lightboxIndex + 1} / {images.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
