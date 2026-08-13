import React from 'react';
import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  titleColor?: string;
  titleX?: number;
  titleY?: number;
  subtitle?: string;
  subtitleColor?: string;
  subtitleX?: number;
  subtitleY?: number;
  backgroundImage?: {
    url: string;
    alt?: string;
  };
  backgroundImageVisibility?: number;
}

export function PageHeader({ 
  title, titleColor, titleX, titleY,
  subtitle, subtitleColor, subtitleX, subtitleY,
  backgroundImage, backgroundImageVisibility = 20 
}: PageHeaderProps) {
  const opacity = 1 - (backgroundImageVisibility / 100);
  const blur = opacity * 10;
  
  return (
      <section className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden min-h-[400px]">
        {backgroundImage?.url ? (
          <>
            <Image
              src={backgroundImage.url}
              alt={backgroundImage.alt || "Background"}
              fill
              priority
              quality={100}
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
        <div className="absolute inset-0 z-10 overflow-hidden">
          <h1 
            className="absolute text-4xl md:text-6xl font-bold tracking-tight w-full max-w-4xl text-center"
            style={{ 
              left: `${titleX ?? 50}%`, 
              top: `${titleY ?? 45}%`,
              transform: 'translate(-50%, -50%)',
              color: titleColor || 'var(--heading)'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="absolute text-xl w-full max-w-2xl text-center"
              style={{ 
                left: `${subtitleX ?? 50}%`, 
                top: `${subtitleY ?? 60}%`,
                transform: 'translate(-50%, -50%)',
                color: subtitleColor || 'var(--muted-foreground)'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </section>
  );
}
