"use client";

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PageHeaderProps {
  title: string | null;
  titleColor?: string;
  titleX?: number;
  titleY?: number;
  titleWidth?: number;
  titleFontSize?: number;
  // Mobile overrides
  titleMobileOverride?: boolean;
  titleMobileX?: number;
  titleMobileY?: number;
  titleMobileWidth?: number;
  titleMobileFontSize?: number;

  subtitle?: string;
  subtitleColor?: string;
  subtitleX?: number;
  subtitleY?: number;
  subtitleWidth?: number;
  subtitleFontSize?: number;
  // Mobile overrides
  subtitleMobileOverride?: boolean;
  subtitleMobileX?: number;
  subtitleMobileY?: number;
  subtitleMobileWidth?: number;
  subtitleMobileFontSize?: number;

  backgroundImage?: { url: string; alt?: string };
  backgroundImageVisibility?: number;
}

const toClamp = (px?: number) =>
  px ? `clamp(${Math.max(14, Math.round(px * 0.4))}px, ${(px / 16).toFixed(2)}vw + 1rem, ${px}px)` : undefined;

export function PageHeader({ 
  title, titleColor, titleX, titleY, titleWidth, titleFontSize,
  titleMobileOverride, titleMobileX, titleMobileY, titleMobileWidth, titleMobileFontSize,
  subtitle, subtitleColor, subtitleX, subtitleY, subtitleWidth, subtitleFontSize,
  subtitleMobileOverride, subtitleMobileX, subtitleMobileY, subtitleMobileWidth, subtitleMobileFontSize,
  backgroundImage, backgroundImageVisibility = 20 
}: PageHeaderProps) {
  // Convert visibility (0–100) to overlay opacity (0 = fully transparent overlay = fully visible image)
  const overlayOpacity = 1 - (backgroundImageVisibility / 100);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Resolve effective values
  const resolvedTitleX = isMobile && titleMobileOverride ? (titleMobileX ?? 0) : (titleX ?? 0);
  const resolvedTitleY = isMobile && titleMobileOverride ? (titleMobileY ?? 20) : (titleY ?? 30);
  const resolvedTitleW = isMobile && titleMobileOverride ? (titleMobileWidth ?? 100) : (titleWidth ?? 100);
  const resolvedTitleFs = isMobile && titleMobileOverride ? titleMobileFontSize : titleFontSize;

  const resolvedSubX = isMobile && subtitleMobileOverride ? (subtitleMobileX ?? 0) : (subtitleX ?? 0);
  const resolvedSubY = isMobile && subtitleMobileOverride ? (subtitleMobileY ?? 55) : (subtitleY ?? 60);
  const resolvedSubW = isMobile && subtitleMobileOverride ? (subtitleMobileWidth ?? 100) : (subtitleWidth ?? 100);
  const resolvedSubFs = isMobile && subtitleMobileOverride ? subtitleMobileFontSize : subtitleFontSize;

  return (
    <section className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden min-h-[400px]">
      {backgroundImage?.url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage.url}
            alt={backgroundImage.alt || "Background"}
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
          />
          <div className="absolute inset-0 z-0 transition-all duration-200" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.7})` }} />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-muted/30" />
      )}

      <div className="absolute inset-0 z-10 overflow-hidden">
        <div 
          className="absolute"
          style={{ 
            left: `${resolvedTitleX}%`, 
            top: `${resolvedTitleY}%`,
            width: `${resolvedTitleW}%`,
            minWidth: '10%',
            minHeight: 'max-content',
            fontSize: toClamp(resolvedTitleFs),
          }}
        >
          <h1 className="font-bold tracking-tight w-full text-center" style={{ color: titleColor || 'var(--heading)' }}>
            {title ?? ""}
          </h1>
        </div>

        {subtitle && (
          <div 
            className="absolute"
            style={{ 
              left: `${resolvedSubX}%`, 
              top: `${resolvedSubY}%`,
              width: `${resolvedSubW}%`,
              minWidth: '10%',
              minHeight: 'max-content',
              fontSize: toClamp(resolvedSubFs),
            }}
          >
            <p className="w-full text-center" style={{ color: subtitleColor || 'var(--muted-foreground)' }}>
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
