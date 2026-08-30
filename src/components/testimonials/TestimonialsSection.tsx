"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCard, TestimonialData } from "./TestimonialCard";

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  // Sort by order field, then by natural order
  const active = [...testimonials].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    if (!isCatalogExpanded) {
      checkScrollState();
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("scroll", checkScrollState, { passive: true });
        window.addEventListener("resize", checkScrollState);
        return () => {
          container.removeEventListener("scroll", checkScrollState);
          window.removeEventListener("resize", checkScrollState);
        };
      }
    }
  }, [checkScrollState, isCatalogExpanded, active.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollDistance = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const handleExpandCatalog = () => {
    setIsCatalogExpanded(true);
    setVisibleCount(9);
  };

  const handleCollapseToFeatured = () => {
    setIsCatalogExpanded(false);
    const section = document.getElementById("testimonials");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (active.length === 0) {
    return (
      <div className="text-center py-24 border rounded-3xl bg-card">
        <h2 className="text-2xl font-bold mb-3">No Testimonials Yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're gathering feedback from our recent clients. Check back soon to hear about
          their experiences working with us.
        </p>
      </div>
    );
  }

  const featuredTestimonials = active.slice(0, 6);
  const gridTestimonials = active.slice(0, visibleCount);

  return (
    <div id="testimonials" className="space-y-8">
      {/* Section header row with scroll/collapse controls */}
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {isCatalogExpanded
            ? `Showing ${Math.min(visibleCount, active.length)} of ${active.length} testimonials`
            : `${active.length} client testimonial${active.length !== 1 ? "s" : ""}`}
        </p>

        {!isCatalogExpanded && featuredTestimonials.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="h-9 w-9 rounded-full shadow-xs disabled:opacity-30"
              aria-label="Scroll testimonials left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="h-9 w-9 rounded-full shadow-xs disabled:opacity-30"
              aria-label="Scroll testimonials right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isCatalogExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseToFeatured}
            className="rounded-full gap-1.5 text-xs font-medium shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Show Row View</span>
          </Button>
        )}
      </div>

      {/* VIEW MODE 1: Horizontal scrolling row (first 6) */}
      {!isCatalogExpanded && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div
              ref={scrollContainerRef}
              className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {featuredTestimonials.map((testimonial, index) => (
                <div
                  key={`featured-${testimonial.id || index}`}
                  className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start flex flex-col"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* See More button (only when > 6 testimonials) */}
          {active.length > 6 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleExpandCatalog}
                className="rounded-full px-7 gap-2 text-sm font-semibold border-primary/40 hover:border-primary hover:bg-primary/5 shadow-xs transition-all"
              >
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span>See All Testimonials ({active.length} Total)</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Expanded paginated grid */}
      {isCatalogExpanded && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridTestimonials.map((testimonial, index) => (
              <div key={`grid-${testimonial.id || index}`} className="flex flex-col">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t">
            {visibleCount < active.length && (
              <Button
                variant="default"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="rounded-full px-8 font-medium shadow-sm"
              >
                Show More ({active.length - visibleCount} Remaining)
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseToFeatured}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Collapse to Featured View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
