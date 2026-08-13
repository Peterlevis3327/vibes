import React from 'react';
import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  titleColor?: string;
  titleX?: number;
  titleY?: number;
  titleWidth?: number;
  titleHeight?: number;
  subtitle?: string;
  subtitleColor?: string;
  subtitleX?: number;
  subtitleY?: number;
  subtitleWidth?: number;
  subtitleHeight?: number;
  backgroundImage?: {
    url: string;
    alt?: string;
  };
  backgroundImageVisibility?: number;
}

export function PageHeader({ 
  title, titleColor, titleX, titleY, titleWidth, titleHeight,
  subtitle, subtitleColor, subtitleX, subtitleY, subtitleWidth, subtitleHeight,
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
          <div 
            className="absolute"
            style={{ 
              left: `${titleX ?? 0}%`, 
              top: `${titleY ?? 30}%`,
              width: `${titleWidth ?? 100}%`,
              height: titleHeight ? `${titleHeight}%` : 'auto',
              minWidth: '10%',
              minHeight: 'max-content'
            }}
          >
            <h1 
              className="text-4xl md:text-6xl font-bold tracking-tight w-full text-center"
              style={{ color: titleColor || 'var(--heading)' }}
            >
              {title}
            </h1>
          </div>
          {subtitle && (
            <div 
              className="absolute"
              style={{ 
                left: `${subtitleX ?? 0}%`, 
                top: `${subtitleY ?? 60}%`,
                width: `${subtitleWidth ?? 100}%`,
                height: subtitleHeight ? `${subtitleHeight}%` : 'auto',
                minWidth: '10%',
                minHeight: 'max-content'
              }}
            >
              <p 
                className="text-xl w-full text-center"
                style={{ color: subtitleColor || 'var(--muted-foreground)' }}
              >
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </section>
  );
}
