"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";
import { LiveEditor } from "@/components/admin/LiveEditor";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { saveWithVersionHistory, getHomePageData, getPageData } from "@/lib/firebase/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Default structures
const initialHomePageData = {
  heroHeadline: "We design and build products that drive results.",
  heroHeadlineColor: "",
  heroHeadlineX: 0,
  heroHeadlineY: 30,
  heroHeadlineWidth: 100,
  heroSubheadline: "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
  heroSubheadlineColor: "",
  heroSubheadlineX: 0,
  heroSubheadlineY: 60,
  heroSubheadlineWidth: 100,
  seoTitle: "Agency | Digital Product Studio",
  seoDescription: "We design and build websites and apps that deliver concrete outcomes.",
  heroBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20
};

const initialGenericPageData = {
  title: "",
  titleColor: "",
  titleX: 0,
  titleY: 30,
  titleWidth: 100,
  subtitle: "",
  subtitleColor: "",
  subtitleX: 0,
  subtitleY: 60,
  subtitleWidth: 100,
  headerBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20
};

// Helper function to calculate overlay styles
const getOverlayStyle = (visibility = 20) => {
  const opacity = 1 - (visibility / 100);
  const blur = opacity * 10;
  return {
    opacity,
    backdropFilter: `blur(${blur}px)`
  };
};
const HomePreview = ({ data, onChange, isEditing }: { data: typeof initialHomePageData & any, onChange?: any, isEditing?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerSize({ 
            width: entries[0].contentRect.width, 
            height: entries[0].contentRect.height 
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className={`flex flex-col w-full font-sans ${isEditing ? 'select-none' : ''}`}>
      <section ref={containerRef} className="relative px-4 md:px-8 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden min-h-[600px]">
        {data.heroBackgroundImage?.url && (
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${data.heroBackgroundImage.url})` }}
            />
            <div 
              className="absolute inset-0 bg-background z-0 transition-all duration-200"
              style={getOverlayStyle(data.backgroundImageVisibility)}
            ></div>
          </>
        )}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {!isEditing ? (
            <>
              {/* Static View for when not editing (exact match to live view) */}
              <div 
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${data.heroHeadlineX ?? 0}%`, 
                  top: `${data.heroHeadlineY ?? 30}%`,
                  width: `${data.heroHeadlineWidth ?? 100}%`,
                  height: data.heroHeadlineHeight ? `${data.heroHeadlineHeight}%` : 'auto',
                  minWidth: '10%',
                  minHeight: 'max-content'
                }}
              >
                <h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight w-full text-center"
                  style={{ color: data.heroHeadlineColor || 'var(--heading)' }}
                >
                  {data.heroHeadline?.includes("drive results.") ? (
                    <>We design and build products that <span className="opacity-70">drive results.</span></>
                  ) : (
                    data.heroHeadline
                  )}
                </h1>
              </div>
              <div 
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${data.heroSubheadlineX ?? 0}%`, 
                  top: `${data.heroSubheadlineY ?? 60}%`,
                  width: `${data.heroSubheadlineWidth ?? 100}%`,
                  height: data.heroSubheadlineHeight ? `${data.heroSubheadlineHeight}%` : 'auto',
                  minWidth: '10%',
                  minHeight: 'max-content'
                }}
              >
                <p 
                  className="text-xl md:text-2xl w-full text-center text-balance"
                  style={{ color: data.heroSubheadlineColor || 'var(--muted-foreground)' }}
                >
                  {data.heroSubheadline}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Rnd Editors for exact control */}
              <Rnd
                bounds="parent"
                disableDragging={!isEditing}
                enableResizing={isEditing}
                className={`pointer-events-auto ${isEditing ? 'border-2 border-dashed border-primary/50 bg-background/5' : ''}`}
                size={{
                  width: `${data.heroHeadlineWidth ?? 100}%`,
                  height: data.heroHeadlineHeight ? `${data.heroHeadlineHeight}%` : 'auto'
                }}
                position={{
                  x: containerSize.width ? (containerSize.width * (data.heroHeadlineX ?? 0)) / 100 : 0,
                  y: containerSize.height ? (containerSize.height * (data.heroHeadlineY ?? 30)) / 100 : 0
                }}
                onDragStop={(e, d) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('heroHeadlineX', (d.x / containerSize.width) * 100);
                    onChange('heroHeadlineY', (d.y / containerSize.height) * 100);
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('heroHeadlineWidth', (ref.offsetWidth / containerSize.width) * 100);
                    onChange('heroHeadlineHeight', (ref.offsetHeight / containerSize.height) * 100);
                    onChange('heroHeadlineX', (position.x / containerSize.width) * 100);
                    onChange('heroHeadlineY', (position.y / containerSize.height) * 100);
                  }
                }}
                minWidth="10%"
                minHeight="max-content"
                style={{ zIndex: 20 }}
              >
                <h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight w-full text-center"
                  style={{ color: data.heroHeadlineColor || 'var(--heading)' }}
                >
                  {data.heroHeadline?.includes("drive results.") ? (
                    <>We design and build products that <span className="opacity-70">drive results.</span></>
                  ) : (
                    data.heroHeadline
                  )}
                </h1>
              </Rnd>

              <Rnd
                bounds="parent"
                disableDragging={!isEditing}
                enableResizing={isEditing}
                className={`pointer-events-auto ${isEditing ? 'border-2 border-dashed border-primary/50 bg-background/5' : ''}`}
                size={{
                  width: `${data.heroSubheadlineWidth ?? 100}%`,
                  height: data.heroSubheadlineHeight ? `${data.heroSubheadlineHeight}%` : 'auto'
                }}
                position={{
                  x: containerSize.width ? (containerSize.width * (data.heroSubheadlineX ?? 0)) / 100 : 0,
                  y: containerSize.height ? (containerSize.height * (data.heroSubheadlineY ?? 60)) / 100 : 0
                }}
                onDragStop={(e, d) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('heroSubheadlineX', (d.x / containerSize.width) * 100);
                    onChange('heroSubheadlineY', (d.y / containerSize.height) * 100);
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('heroSubheadlineWidth', (ref.offsetWidth / containerSize.width) * 100);
                    onChange('heroSubheadlineHeight', (ref.offsetHeight / containerSize.height) * 100);
                    onChange('heroSubheadlineX', (position.x / containerSize.width) * 100);
                    onChange('heroSubheadlineY', (position.y / containerSize.height) * 100);
                  }
                }}
                minWidth="10%"
                minHeight="max-content"
                style={{ zIndex: 20 }}
              >
                <p 
                  className="text-xl md:text-2xl w-full text-center text-balance"
                  style={{ color: data.heroSubheadlineColor || 'var(--muted-foreground)' }}
                >
                  {data.heroSubheadline}
                </p>
              </Rnd>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// Preview component for generic pages
const GenericPagePreview = ({ data, onChange, isEditing }: { data: typeof initialGenericPageData & any, onChange?: any, isEditing?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerSize({ 
            width: entries[0].contentRect.width, 
            height: entries[0].contentRect.height 
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className={`flex flex-col w-full font-sans ${isEditing ? 'select-none' : ''}`}>
      <section ref={containerRef} className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden min-h-[400px]">
        {data.headerBackgroundImage?.url ? (
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${data.headerBackgroundImage.url})` }}
            />
            <div 
              className="absolute inset-0 bg-background z-0 transition-all duration-200"
              style={getOverlayStyle(data.backgroundImageVisibility)}
            ></div>
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted/30"></div>
        )}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {!isEditing ? (
            <>
              <div 
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${data.titleX ?? 0}%`, 
                  top: `${data.titleY ?? 30}%`,
                  width: `${data.titleWidth ?? 100}%`,
                  height: data.titleHeight ? `${data.titleHeight}%` : 'auto',
                  minWidth: '10%',
                  minHeight: 'max-content'
                }}
              >
                <h1 
                  className="text-4xl md:text-6xl font-bold tracking-tight w-full text-center"
                  style={{ color: data.titleColor || 'var(--heading)' }}
                >
                  {data.title || "Page Title"}
                </h1>
              </div>
              <div 
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${data.subtitleX ?? 0}%`, 
                  top: `${data.subtitleY ?? 60}%`,
                  width: `${data.subtitleWidth ?? 100}%`,
                  height: data.subtitleHeight ? `${data.subtitleHeight}%` : 'auto',
                  minWidth: '10%',
                  minHeight: 'max-content'
                }}
              >
                <p 
                  className="text-xl w-full text-center"
                  style={{ color: data.subtitleColor || 'var(--muted-foreground)' }}
                >
                  {data.subtitle || "Page subtitle goes here."}
                </p>
              </div>
            </>
          ) : (
            <>
              <Rnd
                bounds="parent"
                disableDragging={!isEditing}
                enableResizing={isEditing}
                className={`pointer-events-auto ${isEditing ? 'border-2 border-dashed border-primary/50 bg-background/5' : ''}`}
                size={{
                  width: `${data.titleWidth ?? 100}%`,
                  height: data.titleHeight ? `${data.titleHeight}%` : 'auto'
                }}
                position={{
                  x: containerSize.width ? (containerSize.width * (data.titleX ?? 0)) / 100 : 0,
                  y: containerSize.height ? (containerSize.height * (data.titleY ?? 30)) / 100 : 0
                }}
                onDragStop={(e, d) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('titleX', (d.x / containerSize.width) * 100);
                    onChange('titleY', (d.y / containerSize.height) * 100);
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('titleWidth', (ref.offsetWidth / containerSize.width) * 100);
                    onChange('titleHeight', (ref.offsetHeight / containerSize.height) * 100);
                    onChange('titleX', (position.x / containerSize.width) * 100);
                    onChange('titleY', (position.y / containerSize.height) * 100);
                  }
                }}
                minWidth="10%"
                minHeight="max-content"
                style={{ zIndex: 20 }}
              >
                <h1 
                  className="text-4xl md:text-6xl font-bold tracking-tight w-full text-center"
                  style={{ color: data.titleColor || 'var(--heading)' }}
                >
                  {data.title || "Page Title"}
                </h1>
              </Rnd>

              <Rnd
                bounds="parent"
                disableDragging={!isEditing}
                enableResizing={isEditing}
                className={`pointer-events-auto ${isEditing ? 'border-2 border-dashed border-primary/50 bg-background/5' : ''}`}
                size={{
                  width: `${data.subtitleWidth ?? 100}%`,
                  height: data.subtitleHeight ? `${data.subtitleHeight}%` : 'auto'
                }}
                position={{
                  x: containerSize.width ? (containerSize.width * (data.subtitleX ?? 0)) / 100 : 0,
                  y: containerSize.height ? (containerSize.height * (data.subtitleY ?? 60)) / 100 : 0
                }}
                onDragStop={(e, d) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('subtitleX', (d.x / containerSize.width) * 100);
                    onChange('subtitleY', (d.y / containerSize.height) * 100);
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (onChange && containerSize.width && containerSize.height) {
                    onChange('subtitleWidth', (ref.offsetWidth / containerSize.width) * 100);
                    onChange('subtitleHeight', (ref.offsetHeight / containerSize.height) * 100);
                    onChange('subtitleX', (position.x / containerSize.width) * 100);
                    onChange('subtitleY', (position.y / containerSize.height) * 100);
                  }
                }}
                minWidth="10%"
                minHeight="max-content"
                style={{ zIndex: 20 }}
              >
                <p 
                  className="text-xl w-full text-center"
                  style={{ color: data.subtitleColor || 'var(--muted-foreground)' }}
                >
                  {data.subtitle || "Page subtitle goes here."}
                </p>
              </Rnd>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// Component to handle individual page editing
const PageEditor = ({ pageId, initialData, fetcher, PreviewComponent, title }: any) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await fetcher(pageId);
      if (dbData) {
        setData({ ...initialData, ...dbData });
      } else {
        setData(initialData);
      }
    }
    loadData();
  }, [pageId, fetcher, initialData]);

  const handleSave = async (savedData: any) => {
    try {
      await saveWithVersionHistory("pages", pageId, savedData);
      await revalidatePublicRoutes("pages", pageId);
      toast("Settings saved", {
        description: `The ${pageId} page content has been updated.`,
      });
    } catch (e) {
      toast.error("Error saving", {
        description: "There was a problem saving your changes.",
      });
    }
  };

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <LiveEditor 
      title={title}
      initialData={data}
      PreviewComponent={PreviewComponent}
      onSave={handleSave}
      collectionName="pages"
      docId={pageId}
    />
  );
};

export default function AdminPages() {
  const pagesConfig = [
    { id: "home", label: "Home", initialData: initialHomePageData, Preview: HomePreview, fetcher: () => getHomePageData() },
    { id: "services", label: "Services", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
    { id: "portfolio", label: "Portfolio", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
    { id: "process", label: "Process", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
    { id: "about", label: "About", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
    { id: "testimonials", label: "Testimonials", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
    { id: "posts", label: "Posts", initialData: initialGenericPageData, Preview: GenericPagePreview, fetcher: (id: string) => getPageData(id) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">Edit static page content with real-time preview.</p>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          {pagesConfig.map(page => (
            <TabsTrigger key={page.id} value={page.id}>{page.label}</TabsTrigger>
          ))}
        </TabsList>
        
        {pagesConfig.map(page => (
          <TabsContent key={page.id} value={page.id} className="mt-0">
            <PageEditor 
              pageId={page.id}
              initialData={page.initialData}
              fetcher={page.fetcher}
              PreviewComponent={page.Preview}
              title={`${page.label} Page Hero`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
