"use client";

import { useState } from "react";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface TestimonialData {
  id: string;
  clientName?: string;
  name?: string;
  clientRole?: string;
  role?: string;
  clientCompany?: string;
  company?: string;
  quote: string;
  rating?: number; // 1–5, defaults to 5
  date?: string;
  avatar?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  relatedProjectId?: string;
  order?: number;
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const clientName = testimonial.clientName || testimonial.name || "Client";
  const clientRole = testimonial.clientRole || testimonial.role || "";
  const clientCompany = testimonial.clientCompany || testimonial.company || "";
  const roleAndCompany = [clientRole, clientCompany].filter(Boolean).join(" • ");
  const rating = Math.min(Math.max(Number(testimonial.rating) || 5, 1), 5);

  // Generate initials from name (up to 2 characters)
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div
      onClick={toggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleExpand();
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      className={`group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl border bg-card transition-all duration-300 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isExpanded
          ? "border-primary/60 shadow-md ring-1 ring-primary/20"
          : "border-border/60 hover:border-primary/40 hover:shadow-md"
      }`}
    >
      <div className="flex-1 flex flex-col">
        {/* Rating Stars & Quote Icon */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/25"
                }`}
              />
            ))}
          </div>
          <Quote className="w-6 h-6 text-primary/30 group-hover:text-primary/60 transition-colors shrink-0" />
        </div>

        {/* Quote Text — truncated by default, expands on hover or tap */}
        <div className="flex-1 min-h-[5.5rem]">
          <blockquote
            className={`text-sm text-foreground/90 leading-relaxed italic transition-all duration-300 ${
              isExpanded
                ? "line-clamp-none max-h-60 overflow-y-auto pr-1"
                : "line-clamp-4 group-hover:line-clamp-none group-hover:max-h-60 group-hover:overflow-y-auto group-hover:pr-1"
            }`}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Client Profile Footer */}
      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border/40 shrink-0">
        {/* Avatar or Initials */}
        {testimonial.avatar?.url ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border/80 bg-muted">
            <Image
              src={testimonial.avatar.url}
              alt={testimonial.avatar.alt || clientName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground truncate">{clientName}</h4>
          {roleAndCompany && (
            <p className="text-xs text-muted-foreground truncate">{roleAndCompany}</p>
          )}
          {testimonial.date && (
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{testimonial.date}</p>
          )}
        </div>
      </div>

      {/* Caption below avatar (if set) */}
      {testimonial.avatar?.showCaption && testimonial.avatar?.caption && (
        <p className="text-xs text-muted-foreground mt-2 italic ml-[3.25rem]">
          {testimonial.avatar.caption}
        </p>
      )}

      {/* Related project link */}
      {testimonial.relatedProjectId && (
        <div className="pt-3 mt-1 border-t border-border/30">
          <Link
            href={`/portfolio/${testimonial.relatedProjectId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary hover:underline"
          >
            Read Case Study →
          </Link>
        </div>
      )}
    </div>
  );
}
