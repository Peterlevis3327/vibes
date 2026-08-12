"use client";

import { useEffect, useState } from "react";
import { LiveEditor } from "@/components/admin/LiveEditor";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { saveWithVersionHistory, getHomePageData, getPageData } from "@/lib/firebase/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Default structures
const initialHomePageData = {
  availabilityBadge: "Available for new projects in Q4",
  heroHeadline: "We design and build products that drive results.",
  heroSubheadline: "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
  primaryCtaText: "Start a Project",
  secondaryCtaText: "View Our Work",
  seoTitle: "Agency | Digital Product Studio",
  seoDescription: "We design and build websites and apps that deliver concrete outcomes.",
  heroBackgroundImage: { url: "", alt: "", caption: "", showCaption: false }
};

const initialGenericPageData = {
  title: "",
  subtitle: "",
  headerBackgroundImage: { url: "", alt: "", caption: "", showCaption: false }
};

// Simplified preview component that mimics the home page hero
const HomePreview = ({ data }: { data: typeof initialHomePageData }) => {
  return (
    <div className="flex flex-col w-full font-sans">
      <section className="relative px-4 md:px-8 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
        {data.heroBackgroundImage?.url && (
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${data.heroBackgroundImage.url})` }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-0"></div>
          </>
        )}
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            {data.availabilityBadge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
            {/* Simple hack to render the highlighted text if it matches our pattern, otherwise just render the string */}
            {data.heroHeadline?.includes("drive results.") ? (
              <>We design and build products that <span className="text-muted-foreground">drive results.</span></>
            ) : (
              data.heroHeadline
            )}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
            {data.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base px-8 h-12">
              {data.primaryCtaText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12">
              {data.secondaryCtaText}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Preview component for generic pages
const GenericPagePreview = ({ data }: { data: typeof initialGenericPageData }) => {
  return (
    <div className="flex flex-col w-full font-sans">
      <section className="relative px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
        {data.headerBackgroundImage?.url ? (
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${data.headerBackgroundImage.url})` }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-0"></div>
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted/30"></div>
        )}
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{data.title || "Page Title"}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle || "Page subtitle goes here."}
          </p>
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
