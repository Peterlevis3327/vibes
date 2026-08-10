"use client";

import { useEffect, useState } from "react";

import { LiveEditor } from "@/components/admin/LiveEditor";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { saveWithVersionHistory, getHomePageData } from "@/lib/firebase/db";

// This is the data structure we will store in Firestore
// This is the default structure if none exists in Firestore
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
            {data.heroHeadline.includes("drive results.") ? (
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

// ... [existing HomePreview component code remains unchanged below this block in the file, handled via a later chunk if needed or untouched]

export default function AdminPages() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getHomePageData();
      if (dbData) {
        // Ensure new fields exist even if old DB document doesn't have them
        setData({ ...initialHomePageData, ...dbData });
      } else {
        setData(initialHomePageData);
      }
    }
    loadData();
  }, []);

  const handleSave = async (savedData: any) => {
    try {
      // For the demo we use a static 'home' id
      await saveWithVersionHistory("pages", "home", savedData);
      await revalidatePublicRoutes("pages", "home");
      toast("Settings saved", {
        description: "The home page content has been updated.",
      });
    } catch (e) {
      toast.error("Error saving", {
        description: "There was a problem saving your changes.",
      });
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">Edit static page content with real-time preview.</p>
      </div>

      <LiveEditor 
        title="Home Page Hero"
        initialData={data}
        PreviewComponent={HomePreview}
        onSave={handleSave}
        collectionName="pages"
        docId="home"
      />
    </div>
  );
}
