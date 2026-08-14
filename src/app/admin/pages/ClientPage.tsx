"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { LiveEditor } from "@/components/admin/LiveEditor";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { toast } from "sonner";
import { saveWithVersionHistory, getHomePageData, getPageData } from "@/lib/firebase/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------- Default data structures ----------

const initialHomePageData = {
  heroHeadline: "We design and build products that drive results.",
  heroHeadlineColor: "",
  heroHeadlineFontSize: 56,
  heroHeadlineX: 0,
  heroHeadlineY: 30,
  heroHeadlineWidth: 100,
  // Mobile override
  heroHeadlineMobileOverride: false,
  heroHeadlineMobileX: 0,
  heroHeadlineMobileY: 20,
  heroHeadlineMobileWidth: 100,
  heroHeadlineMobileFontSize: 32,

  heroSubheadline:
    "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
  heroSubheadlineColor: "",
  heroSubheadlineFontSize: 20,
  heroSubheadlineX: 0,
  heroSubheadlineY: 60,
  heroSubheadlineWidth: 100,
  // Mobile override
  heroSubheadlineMobileOverride: false,
  heroSubheadlineMobileX: 0,
  heroSubheadlineMobileY: 55,
  heroSubheadlineMobileWidth: 100,
  heroSubheadlineMobileFontSize: 16,

  seoTitle: "Agency | Digital Product Studio",
  seoDescription:
    "We design and build websites and apps that deliver concrete outcomes.",
  
  trustSignal1Value: "",
  trustSignal1Label: "",
  trustSignal2Value: "",
  trustSignal2Label: "",
  trustSignal3Value: "",
  trustSignal3Label: "",
  trustSignal4Value: "",
  trustSignal4Label: "",
  
  capabilitiesTitle: "Capabilities",
  capabilitiesDescription: "We focus on what we do best: building exceptional digital products from scratch.",
  
  selectedWorkTitle: "Selected Work",
  selectedWorkDescription: "A glimpse into our recent partnerships and the results we've delivered.",
  
  processTitle: "How we work",
  processDescription: "We don't believe in black boxes. Our process is transparent, collaborative, and designed to eliminate surprises while maximizing impact.",
  processStep1Title: "Discovery",
  processStep1Description: "Understanding your business, audience, and goals.",
  processStep2Title: "Design",
  processStep2Description: "Crafting intuitive, beautiful interfaces that align with your brand.",
  processStep3Title: "Development",
  processStep3Description: "Writing clean, scalable code to bring the designs to life.",
  processStep4Title: "Launch",
  processStep4Description: "Rigorous testing and a smooth deployment to production.",

  faqTitle: "Frequently Asked Questions",
  faqDescription: "Everything you need to know about working with us.",

  ctaTitle: "Ready to build something extraordinary?",
  ctaDescription: "Let's discuss how we can help your business achieve its goals through exceptional digital products.",
  ctaButtonText: "Start a Conversation",

  heroBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20,
};

const initialGenericPageData = {
  title: null,
  titleColor: "",
  titleFontSize: 48,
  titleX: 0,
  titleY: 30,
  titleWidth: 100,
  // Mobile override
  titleMobileOverride: false,
  titleMobileX: 0,
  titleMobileY: 20,
  titleMobileWidth: 100,
  titleMobileFontSize: 28,

  subtitle: null,
  subtitleColor: "",
  subtitleFontSize: 18,
  subtitleX: 0,
  subtitleY: 60,
  subtitleWidth: 100,
  // Mobile override
  subtitleMobileOverride: false,
  subtitleMobileX: 0,
  subtitleMobileY: 55,
  subtitleMobileWidth: 100,
  subtitleMobileFontSize: 16,

  headerBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20,
};

const initialContentPageData = {
  ...initialGenericPageData,
  content: "",
};

const initialContactPageData = {
  ...initialGenericPageData,
  email: "",
  phone: ""
};

// ---------- Helpers ----------

const getOverlayStyle = (visibility = 20) => {
  const overlayOpacity = 1 - visibility / 100;
  return { backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.7})` };
};

/** Converts a flat pixel font size to a responsive clamp() string */
const toClampFontSize = (px: number) =>
  `clamp(${Math.max(14, Math.round(px * 0.4))}px, ${(px / 16).toFixed(2)}vw + 1rem, ${px}px)`;

// ---------- CanvasTextBox ----------

interface TextBoxProps {
  xPct: number;
  yPct: number;
  widthPct: number;
  containerWidth: number;
  containerHeight: number;
  onMove: (xPct: number, yPct: number, widthPct: number) => void;
  stableKey: string;
  fontSize?: number;
  color?: string;
  isEditing: boolean;
  /** When true, show the mobile override badge if override not yet enabled */
  isMobilePreview?: boolean;
  /** Whether this element's mobile override is currently enabled */
  mobileOverrideEnabled?: boolean;
  /** Called when admin clicks "Customize for mobile" badge */
  onEnableMobileOverride?: () => void;
  children: React.ReactNode;
}

function CanvasTextBox({
  xPct,
  yPct,
  widthPct,
  containerWidth,
  containerHeight,
  onMove,
  stableKey,
  fontSize,
  color,
  isEditing,
  isMobilePreview,
  mobileOverrideEnabled,
  onEnableMobileOverride,
  children,
}: TextBoxProps) {
  const toPx = useCallback(
    (pct: number, total: number) => (pct / 100) * total,
    []
  );

  const rndRef = useRef<any>(null);

  useEffect(() => {
    if (rndRef.current && containerWidth && containerHeight) {
      rndRef.current.updatePosition({
        x: toPx(xPct ?? 0, containerWidth),
        y: toPx(yPct ?? 0, containerHeight),
      });
      rndRef.current.updateSize({
        width: toPx(widthPct ?? 100, containerWidth),
        height: "auto",
      });
    }
  }, [xPct, yPct, widthPct, containerWidth, containerHeight, toPx]);

  if (!containerWidth || !containerHeight) return null;

  const x = toPx(xPct ?? 0, containerWidth);
  const y = toPx(yPct ?? 0, containerHeight);
  const w = toPx(widthPct ?? 100, containerWidth);
  const minW = toPx(10, containerWidth);
  const maxH = containerHeight - y;



  return (
    <Rnd
      ref={rndRef}
      key={stableKey}
      default={{ x, y, width: w, height: "auto" as unknown as number }}
      minWidth={minW}
      minHeight={50}
      maxHeight={maxH}
      bounds="parent"
      disableDragging={!isEditing}
      enableResizing={
        isEditing
          ? { top: false, topLeft: false, topRight: false, bottom: false, bottomLeft: false, bottomRight: false, left: true, right: true }
          : false
      }
      style={{ zIndex: 20 }}
      className={isEditing ? "border-2 border-dashed border-primary/60 bg-background/5 cursor-move rounded" : ""}
      onDragStop={(_e, d) => {
        if (containerWidth && containerHeight) {
          onMove((d.x / containerWidth) * 100, (d.y / containerHeight) * 100, widthPct);
        }
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        if (containerWidth && containerHeight) {
          onMove(
            (position.x / containerWidth) * 100,
            (position.y / containerHeight) * 100,
            (ref.offsetWidth / containerWidth) * 100
          );
        }
      }}
    >
      <div
        style={{
          fontSize: fontSize ? toClampFontSize(fontSize) : undefined,
          color: color || undefined,
          width: "100%",
          maxHeight: maxH,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}

        {/* Inline mobile override badge — shown only in mobile preview when override not yet set */}
        {isMobilePreview && !mobileOverrideEnabled && onEnableMobileOverride && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEnableMobileOverride(); }}
            className="absolute bottom-1 right-1 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors z-50"
            title="Set mobile-specific position and size"
          >
            📱 Customize for mobile
          </button>
        )}

        {/* Badge confirming override is active */}
        {isMobilePreview && mobileOverrideEnabled && (
          <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-green-600 text-white shadow-md z-50 pointer-events-none">
            📱 Mobile override active
          </div>
        )}
      </div>
    </Rnd>
  );
}

// ---------- StaticTextBox ----------

function StaticTextBox({
  xPct,
  yPct,
  widthPct,
  fontSize,
  color,
  children,
}: {
  xPct: number;
  yPct: number;
  widthPct: number;
  fontSize?: number;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${xPct ?? 0}%`,
        top: `${yPct ?? 0}%`,
        width: `${widthPct ?? 100}%`,
        fontSize: fontSize ? toClampFontSize(fontSize) : undefined,
        color: color || undefined,
        minWidth: "10%",
      }}
    >
      {children}
    </div>
  );
}

// ---------- Home Page Preview ----------

const HomePreview = ({
  data,
  onChange,
  isEditing,
  isPreviewMobile,
}: {
  data: typeof initialHomePageData & Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  isEditing?: boolean;
  isPreviewMobile?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [rndKey, setRndKey] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerSize({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dataLoaded = !!containerSize.width && data.heroHeadlineX !== undefined;
  useEffect(() => {
    if (dataLoaded) setRndKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // Resolve effective values for each text element (mobile override takes effect in mobile preview)
  const headlineOverride = !!data.heroHeadlineMobileOverride;
  const subheadlineOverride = !!data.heroSubheadlineMobileOverride;

  const headlineX = (isPreviewMobile && headlineOverride ? data.heroHeadlineMobileX : data.heroHeadlineX) as number ?? 0;
  const headlineY = (isPreviewMobile && headlineOverride ? data.heroHeadlineMobileY : data.heroHeadlineY) as number ?? 30;
  const headlineW = (isPreviewMobile && headlineOverride ? data.heroHeadlineMobileWidth : data.heroHeadlineWidth) as number ?? 100;
  const headlineFs = (isPreviewMobile && headlineOverride ? data.heroHeadlineMobileFontSize : data.heroHeadlineFontSize) as number;

  const subX = (isPreviewMobile && subheadlineOverride ? data.heroSubheadlineMobileX : data.heroSubheadlineX) as number ?? 0;
  const subY = (isPreviewMobile && subheadlineOverride ? data.heroSubheadlineMobileY : data.heroSubheadlineY) as number ?? 60;
  const subW = (isPreviewMobile && subheadlineOverride ? data.heroSubheadlineMobileWidth : data.heroSubheadlineWidth) as number ?? 100;
  const subFs = (isPreviewMobile && subheadlineOverride ? data.heroSubheadlineMobileFontSize : data.heroSubheadlineFontSize) as number;

  const headlineContent = (
    <h1 className="font-bold tracking-tight text-balance leading-tight w-full text-center">
      {(data.heroHeadline as string)?.includes("drive results.") ? (
        <>We design and build products that <span className="opacity-70">drive results.</span></>
      ) : (data.heroHeadline as string)}
    </h1>
  );

  const subContent = (
    <p className="w-full text-center text-balance">{data.heroSubheadline as string}</p>
  );

  return (
    <div className={`flex flex-col w-full font-sans ${isEditing ? "select-none" : ""}`}>
      <section ref={containerRef} className="relative overflow-hidden" style={{ height: 'clamp(300px, 40vw, 560px)' }}>
        {data.heroBackgroundImage?.url && (
          <>
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${data.heroBackgroundImage.url})` }} />
            <div className="absolute inset-0 bg-background z-0 transition-all duration-200" style={getOverlayStyle(data.backgroundImageVisibility as number)} />
          </>
        )}

        <div className="absolute inset-0 z-10">
          {isEditing ? (
            <>
              <CanvasTextBox
                stableKey={`headline-${rndKey}-${isPreviewMobile ? "m" : "d"}`}
                xPct={headlineX} yPct={headlineY} widthPct={headlineW}
                containerWidth={containerSize.width} containerHeight={containerSize.height}
                fontSize={headlineFs}
                color={data.heroHeadlineColor as string || "var(--heading)"}
                isEditing={true}
                isMobilePreview={isPreviewMobile}
                mobileOverrideEnabled={headlineOverride}
                onEnableMobileOverride={() => onChange?.("heroHeadlineMobileOverride", true)}
                onMove={(x, y, w) => {
                  if (isPreviewMobile && headlineOverride) {
                    onChange?.("heroHeadlineMobileX", x);
                    onChange?.("heroHeadlineMobileY", y);
                    onChange?.("heroHeadlineMobileWidth", w);
                  } else {
                    onChange?.("heroHeadlineX", x);
                    onChange?.("heroHeadlineY", y);
                    onChange?.("heroHeadlineWidth", w);
                  }
                }}
              >
                {headlineContent}
              </CanvasTextBox>

              <CanvasTextBox
                stableKey={`subheadline-${rndKey}-${isPreviewMobile ? "m" : "d"}`}
                xPct={subX} yPct={subY} widthPct={subW}
                containerWidth={containerSize.width} containerHeight={containerSize.height}
                fontSize={subFs}
                color={data.heroSubheadlineColor as string || "var(--muted-foreground)"}
                isEditing={true}
                isMobilePreview={isPreviewMobile}
                mobileOverrideEnabled={subheadlineOverride}
                onEnableMobileOverride={() => onChange?.("heroSubheadlineMobileOverride", true)}
                onMove={(x, y, w) => {
                  if (isPreviewMobile && subheadlineOverride) {
                    onChange?.("heroSubheadlineMobileX", x);
                    onChange?.("heroSubheadlineMobileY", y);
                    onChange?.("heroSubheadlineMobileWidth", w);
                  } else {
                    onChange?.("heroSubheadlineX", x);
                    onChange?.("heroSubheadlineY", y);
                    onChange?.("heroSubheadlineWidth", w);
                  }
                }}
              >
                {subContent}
              </CanvasTextBox>
            </>
          ) : (
            <>
              <StaticTextBox xPct={headlineX} yPct={headlineY} widthPct={headlineW} fontSize={headlineFs} color={data.heroHeadlineColor as string || "var(--heading)"}>{headlineContent}</StaticTextBox>
              <StaticTextBox xPct={subX} yPct={subY} widthPct={subW} fontSize={subFs} color={data.heroSubheadlineColor as string || "var(--muted-foreground)"}>{subContent}</StaticTextBox>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ---------- Generic Page Preview ----------

const GenericPagePreview = ({
  data,
  onChange,
  isEditing,
  isPreviewMobile,
}: {
  data: typeof initialGenericPageData & Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  isEditing?: boolean;
  isPreviewMobile?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [rndKey, setRndKey] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerSize({ width: entries[0].contentRect.width, height: entries[0].contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dataLoaded = !!containerSize.width && data.titleX !== undefined;
  useEffect(() => {
    if (dataLoaded) setRndKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  const titleOverride = !!data.titleMobileOverride;
  const subtitleOverride = !!data.subtitleMobileOverride;

  const titleX = (isPreviewMobile && titleOverride ? data.titleMobileX : data.titleX) as number ?? 0;
  const titleY = (isPreviewMobile && titleOverride ? data.titleMobileY : data.titleY) as number ?? 30;
  const titleW = (isPreviewMobile && titleOverride ? data.titleMobileWidth : data.titleWidth) as number ?? 100;
  const titleFs = (isPreviewMobile && titleOverride ? data.titleMobileFontSize : data.titleFontSize) as number;

  const subX = (isPreviewMobile && subtitleOverride ? data.subtitleMobileX : data.subtitleX) as number ?? 0;
  const subY = (isPreviewMobile && subtitleOverride ? data.subtitleMobileY : data.subtitleY) as number ?? 60;
  const subW = (isPreviewMobile && subtitleOverride ? data.subtitleMobileWidth : data.subtitleWidth) as number ?? 100;
  const subFs = (isPreviewMobile && subtitleOverride ? data.subtitleMobileFontSize : data.subtitleFontSize) as number;

  const titleContent = <h1 className="font-bold tracking-tight w-full text-center">{(data.title as string | null) ?? "Page Title"}</h1>;
  const subContent = <p className="w-full text-center">{(data.subtitle as string | null) ?? "Page subtitle goes here."}</p>;

  return (
    <div className={`flex flex-col w-full font-sans ${isEditing ? "select-none" : ""}`}>
      <section ref={containerRef} className="relative overflow-hidden" style={{ height: 'clamp(300px, 40vw, 560px)' }}>
        {data.headerBackgroundImage?.url ? (
          <>
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${(data.headerBackgroundImage as unknown as Record<string, string>).url})` }} />
            <div className="absolute inset-0 bg-background z-0 transition-all duration-200" style={getOverlayStyle(data.backgroundImageVisibility as number)} />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted/30" />
        )}

        <div className="absolute inset-0 z-10">
          {isEditing ? (
            <>
              <CanvasTextBox
                stableKey={`title-${rndKey}-${isPreviewMobile ? "m" : "d"}`}
                xPct={titleX} yPct={titleY} widthPct={titleW}
                containerWidth={containerSize.width} containerHeight={containerSize.height}
                fontSize={titleFs}
                color={data.titleColor as string || "var(--heading)"}
                isEditing={true}
                isMobilePreview={isPreviewMobile}
                mobileOverrideEnabled={titleOverride}
                onEnableMobileOverride={() => onChange?.("titleMobileOverride", true)}
                onMove={(x, y, w) => {
                  if (isPreviewMobile && titleOverride) {
                    onChange?.("titleMobileX", x); onChange?.("titleMobileY", y); onChange?.("titleMobileWidth", w);
                  } else {
                    onChange?.("titleX", x); onChange?.("titleY", y); onChange?.("titleWidth", w);
                  }
                }}
              >
                {titleContent}
              </CanvasTextBox>

              <CanvasTextBox
                stableKey={`subtitle-${rndKey}-${isPreviewMobile ? "m" : "d"}`}
                xPct={subX} yPct={subY} widthPct={subW}
                containerWidth={containerSize.width} containerHeight={containerSize.height}
                fontSize={subFs}
                color={data.subtitleColor as string || "var(--muted-foreground)"}
                isEditing={true}
                isMobilePreview={isPreviewMobile}
                mobileOverrideEnabled={subtitleOverride}
                onEnableMobileOverride={() => onChange?.("subtitleMobileOverride", true)}
                onMove={(x, y, w) => {
                  if (isPreviewMobile && subtitleOverride) {
                    onChange?.("subtitleMobileX", x); onChange?.("subtitleMobileY", y); onChange?.("subtitleMobileWidth", w);
                  } else {
                    onChange?.("subtitleX", x); onChange?.("subtitleY", y); onChange?.("subtitleWidth", w);
                  }
                }}
              >
                {subContent}
              </CanvasTextBox>
            </>
          ) : (
            <>
              <StaticTextBox xPct={titleX} yPct={titleY} widthPct={titleW} fontSize={titleFs} color={data.titleColor as string || "var(--heading)"}>{titleContent}</StaticTextBox>
              <StaticTextBox xPct={subX} yPct={subY} widthPct={subW} fontSize={subFs} color={data.subtitleColor as string || "var(--muted-foreground)"}>{subContent}</StaticTextBox>
            </>
          )}
        </div>
      </section>

      {/* Render content if it exists */}
      {typeof data.content === "string" && data.content !== "" && (
        <section className="container mx-auto px-4 py-16">
          <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
        </section>
      )}

      {/* Render contact info if it exists */}
      {((typeof data.email === "string" && data.email !== "") || (typeof data.phone === "string" && data.phone !== "")) && (
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          <div className="flex flex-col gap-4 items-center">
            {typeof data.email === "string" && data.email !== "" && <div className="text-lg"><strong>Email:</strong> {data.email}</div>}
            {typeof data.phone === "string" && data.phone !== "" && <div className="text-lg"><strong>Phone:</strong> {data.phone}</div>}
          </div>
        </section>
      )}
    </div>
  );
};

// ---------- Page editor ----------

const PageEditor = ({
  pageId, initialData, fetcher, PreviewComponent, title,
}: {
  pageId: string;
  initialData: Record<string, unknown>;
  fetcher: (id: string) => Promise<Record<string, unknown> | null>;
  PreviewComponent: React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>;
  title: string;
}) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await fetcher(pageId);
      setData(dbData ? { ...initialData, ...dbData } : { ...initialData });
    }
    loadData();
  }, [pageId, fetcher, initialData]);

  const handleSave = async (savedData: Record<string, unknown>) => {
    try {
      await saveWithVersionHistory("pages", pageId, savedData);
      await revalidatePublicRoutes("pages", pageId);
      toast("Settings saved", { description: `The ${pageId} page content has been updated.` });
    } catch {
      toast.error("Error saving", { description: "There was a problem saving your changes." });
    }
  };

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <LiveEditor
      title={title}
      initialData={data}
      PreviewComponent={PreviewComponent as Parameters<typeof LiveEditor>[0]["PreviewComponent"]}
      onSave={handleSave}
      collectionName="pages"
      docId={pageId}
    />
  );
};

// ---------- Default export ----------

export default function AdminPages() {
  const pagesConfig = [
    { id: "home", label: "Home", initialData: initialHomePageData as unknown as Record<string, unknown>, Preview: HomePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: () => getHomePageData() },
    { id: "services", label: "Services", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "portfolio", label: "Portfolio", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "process", label: "Process", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "about", label: "About", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "testimonials", label: "Testimonials", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "posts", label: "Posts", initialData: initialGenericPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "contact", label: "Contact", initialData: initialContactPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "terms", label: "Terms", initialData: initialContentPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
    { id: "privacy", label: "Privacy", initialData: initialContentPageData as unknown as Record<string, unknown>, Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean; isPreviewMobile?: boolean }>, fetcher: (id: string) => getPageData(id) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">Edit static page content with real-time preview.</p>
      </div>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          {pagesConfig.map((page) => (
            <TabsTrigger key={page.id} value={page.id}>{page.label}</TabsTrigger>
          ))}
        </TabsList>
        {pagesConfig.map((page) => (
          <TabsContent key={page.id} value={page.id} className="mt-0">
            <PageEditor pageId={page.id} initialData={page.initialData} fetcher={page.fetcher} PreviewComponent={page.Preview} title={`${page.label} Page Hero`} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
