"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
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
  heroHeadlineX: 50,
  heroHeadlineY: 50,
  heroSubheadline: "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
  heroSubheadlineColor: "",
  heroSubheadlineX: 50,
  heroSubheadlineY: 70,
  seoTitle: "Agency | Digital Product Studio",
  seoDescription: "We design and build websites and apps that deliver concrete outcomes.",
  heroBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20
};

const initialGenericPageData = {
  title: "",
  titleColor: "",
  titleX: 50,
  titleY: 45,
  subtitle: "",
  subtitleColor: "",
  subtitleX: 50,
  subtitleY: 60,
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

  const handleDragEnd = (keyX: string, keyY: string, nodeRef: React.RefObject<HTMLElement | null>) => {
    if (!onChange || !containerRef.current || !nodeRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const node = nodeRef.current.getBoundingClientRect();
    
    // Calculate center of node relative to container as percentage
    const relativeX = ((node.left + node.width / 2 - container.left) / container.width) * 100;
    const relativeY = ((node.top + node.height / 2 - container.top) / container.height) * 100;
    
    onChange(keyX, relativeX);
    onChange(keyY, relativeY);
  };

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
        <div className="absolute inset-0 z-10 overflow-hidden">
          <motion.h1 
            ref={headlineRef}
            drag={isEditing}
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={() => handleDragEnd('heroHeadlineX', 'heroHeadlineY', headlineRef)}
            className={`absolute text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight w-full max-w-4xl text-center ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ 
              left: `${data.heroHeadlineX ?? 50}%`, 
              top: `${data.heroHeadlineY ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              color: data.heroHeadlineColor || 'var(--heading)'
            }}
          >
            {data.heroHeadline?.includes("drive results.") ? (
              <>We design and build products that <span className="opacity-70">drive results.</span></>
            ) : (
              data.heroHeadline
            )}
          </motion.h1>
          <motion.p 
            ref={subheadlineRef}
            drag={isEditing}
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={() => handleDragEnd('heroSubheadlineX', 'heroSubheadlineY', subheadlineRef)}
            className={`absolute text-xl md:text-2xl w-full max-w-2xl text-center text-balance ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ 
              left: `${data.heroSubheadlineX ?? 50}%`, 
              top: `${data.heroSubheadlineY ?? 70}%`,
              transform: 'translate(-50%, -50%)',
              color: data.heroSubheadlineColor || 'var(--muted-foreground)'
            }}
          >
            {data.heroSubheadline}
          </motion.p>
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

  const handleDragEnd = (keyX: string, keyY: string, nodeRef: React.RefObject<HTMLElement | null>) => {
    if (!onChange || !containerRef.current || !nodeRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const node = nodeRef.current.getBoundingClientRect();
    const relativeX = ((node.left + node.width / 2 - container.left) / container.width) * 100;
    const relativeY = ((node.top + node.height / 2 - container.top) / container.height) * 100;
    onChange(keyX, relativeX);
    onChange(keyY, relativeY);
  };

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
        <div className="absolute inset-0 z-10 overflow-hidden">
          <motion.h1 
            ref={titleRef}
            drag={isEditing}
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={() => handleDragEnd('titleX', 'titleY', titleRef)}
            className={`absolute text-4xl md:text-6xl font-bold tracking-tight w-full max-w-4xl text-center ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ 
              left: `${data.titleX ?? 50}%`, 
              top: `${data.titleY ?? 45}%`,
              transform: 'translate(-50%, -50%)',
              color: data.titleColor || 'var(--heading)'
            }}
          >
            {data.title || "Page Title"}
          </motion.h1>
          <motion.p 
            ref={subtitleRef}
            drag={isEditing}
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={() => handleDragEnd('subtitleX', 'subtitleY', subtitleRef)}
            className={`absolute text-xl w-full max-w-2xl text-center ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ 
              left: `${data.subtitleX ?? 50}%`, 
              top: `${data.subtitleY ?? 60}%`,
              transform: 'translate(-50%, -50%)',
              color: data.subtitleColor || 'var(--muted-foreground)'
            }}
          >
            {data.subtitle || "Page subtitle goes here."}
          </motion.p>
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
