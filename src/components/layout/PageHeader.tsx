import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: {
    url: string;
    alt?: string;
  };
}

export function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  return (
    <section className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
      {backgroundImage?.url ? (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${backgroundImage.url})` }}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-0"></div>
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
