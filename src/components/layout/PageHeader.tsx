import React from 'react';
import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: {
    url: string;
    alt?: string;
  };
  backgroundImageVisibility?: number;
}

export function PageHeader({ title, subtitle, backgroundImage, backgroundImageVisibility = 20 }: PageHeaderProps) {
  const opacity = 1 - (backgroundImageVisibility / 100);
  const blur = opacity * 10;
  
  return (
    <section className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
      {backgroundImage?.url ? (
        <>
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt || "Background"}
            fill
            priority
            className="object-cover object-center z-0"
            sizes="100vw"
          />
          <div 
            className="absolute inset-0 bg-background z-0 transition-all duration-200"
            style={{ opacity, backdropFilter: `blur(${blur}px)` }}
          ></div>
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-muted/30"></div>
      )}
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{title}</h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
