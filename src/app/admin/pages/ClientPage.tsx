"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { LiveEditor } from "@/components/admin/LiveEditor";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
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
  heroSubheadline:
    "An independent digital agency crafting high-performance websites and mobile apps for ambitious brands.",
  heroSubheadlineColor: "",
  heroSubheadlineFontSize: 20,
  heroSubheadlineX: 0,
  heroSubheadlineY: 60,
  heroSubheadlineWidth: 100,
  seoTitle: "Agency | Digital Product Studio",
  seoDescription:
    "We design and build websites and apps that deliver concrete outcomes.",
  heroBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20,
};

const initialGenericPageData = {
  title: "",
  titleColor: "",
  titleFontSize: 48,
  titleX: 0,
  titleY: 30,
  titleWidth: 100,
  subtitle: "",
  subtitleColor: "",
  subtitleFontSize: 18,
  subtitleX: 0,
  subtitleY: 60,
  subtitleWidth: 100,
  headerBackgroundImage: { url: "", alt: "", caption: "", showCaption: false },
  backgroundImageVisibility: 20,
};

// ---------- Helpers ----------

const getOverlayStyle = (visibility = 20) => {
  const opacity = 1 - visibility / 100;
  const blur = opacity * 10;
  return { opacity, backdropFilter: `blur(${blur}px)` };
};

// ---------- Reusable canvas text box ----------

interface TextBoxProps {
  /** Percentage values (0-100) */
  xPct: number;
  yPct: number;
  widthPct: number;
  /** px size of the container so we can convert pct ↔ px */
  containerWidth: number;
  containerHeight: number;
  /** Called on drag/resize stop with new pct values */
  onMove: (xPct: number, yPct: number, widthPct: number) => void;
  /** A unique key — changing it resets internal position (e.g., when DB data loads) */
  stableKey: string;
  fontSize?: number;
  color?: string;
  isEditing: boolean;
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
  children,
}: TextBoxProps) {
  // Convert percentages → pixels for react-rnd
  const toPx = useCallback(
    (pct: number, total: number) => (pct / 100) * total,
    []
  );

  if (!containerWidth || !containerHeight) return null;

  const x = toPx(xPct ?? 0, containerWidth);
  const y = toPx(yPct ?? 0, containerHeight);
  const w = toPx(widthPct ?? 100, containerWidth);
  const minW = toPx(10, containerWidth);
  // Maximum height this box can grow to before hitting the section's bottom edge
  const maxH = containerHeight - y;

  return (
    <Rnd
      key={stableKey}
      // Use defaultPosition so react-rnd owns the position during a drag
      // (avoids the feedback-loop jump caused by re-setting `position` on every render)
      default={{
        x,
        y,
        width: w,
        height: "auto" as unknown as number,
      }}
      minWidth={minW}
      minHeight={50}
      maxHeight={maxH}
      bounds="parent"
      disableDragging={!isEditing}
      enableResizing={
        isEditing
          ? {
              top: false,
              topLeft: false,
              topRight: false,
              bottom: false,
              bottomLeft: false,
              bottomRight: false,
              left: true,
              right: true,
            }
          : false
      }
      style={{ zIndex: 20 }}
      className={
        isEditing
          ? "border-2 border-dashed border-primary/60 bg-background/5 cursor-move rounded"
          : ""
      }
      onDragStop={(_e, d) => {
        if (containerWidth && containerHeight) {
          const newX = (d.x / containerWidth) * 100;
          const newY = (d.y / containerHeight) * 100;
          onMove(newX, newY, widthPct);
        }
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        if (containerWidth && containerHeight) {
          const newX = (position.x / containerWidth) * 100;
          const newY = (position.y / containerHeight) * 100;
          const newW = (ref.offsetWidth / containerWidth) * 100;
          onMove(newX, newY, newW);
        }
      }}
    >
      <div
        style={{
          fontSize: fontSize ? `clamp(${Math.max(14, Math.round(fontSize * 0.4))}px, ${(fontSize / 16).toFixed(2)}vw + 1rem, ${fontSize}px)` : undefined,
          color: color || undefined,
          width: "100%",
          // Clip content that would exceed the section boundary
          maxHeight: maxH,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </Rnd>
  );
}

// ---------- Static (non-editing) text box ----------

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
        fontSize: fontSize ? `clamp(${Math.max(14, Math.round(fontSize * 0.4))}px, ${(fontSize / 16).toFixed(2)}vw + 1rem, ${fontSize}px)` : undefined,
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
}: {
  data: typeof initialHomePageData & Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  isEditing?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // Track a stable key that updates only when data is loaded from DB (not on every field change)
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

  // Reset Rnd position when data is first loaded
  const dataLoaded = !!containerSize.width && (data.heroHeadlineX !== undefined);
  useEffect(() => {
    if (dataLoaded) setRndKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  return (
    <div
      className={`flex flex-col w-full font-sans ${isEditing ? "select-none" : ""}`}
    >
      <section
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ minHeight: 600 }}
      >
        {/* Background */}
        {data.heroBackgroundImage?.url && (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${data.heroBackgroundImage.url})`,
              }}
            />
            <div
              className="absolute inset-0 bg-background z-0 transition-all duration-200"
              style={getOverlayStyle(data.backgroundImageVisibility as number)}
            />
          </>
        )}

        {/* Canvas layer */}
        <div className="absolute inset-0 z-10">
          {isEditing ? (
            <>
              <CanvasTextBox
                stableKey={`headline-${rndKey}`}
                xPct={data.heroHeadlineX ?? 0}
                yPct={data.heroHeadlineY ?? 30}
                widthPct={data.heroHeadlineWidth ?? 100}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                fontSize={data.heroHeadlineFontSize as number}
                color={data.heroHeadlineColor as string || "var(--heading)"}
                isEditing={true}
                onMove={(x, y, w) => {
                  onChange?.("heroHeadlineX", x);
                  onChange?.("heroHeadlineY", y);
                  onChange?.("heroHeadlineWidth", w);
                }}
              >
                <h1 className="font-bold tracking-tight text-balance leading-tight w-full text-center">
                  {(data.heroHeadline as string)?.includes("drive results.") ? (
                    <>
                      We design and build products that{" "}
                      <span className="opacity-70">drive results.</span>
                    </>
                  ) : (
                    (data.heroHeadline as string)
                  )}
                </h1>
              </CanvasTextBox>

              <CanvasTextBox
                stableKey={`subheadline-${rndKey}`}
                xPct={data.heroSubheadlineX ?? 0}
                yPct={data.heroSubheadlineY ?? 60}
                widthPct={data.heroSubheadlineWidth ?? 100}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                fontSize={data.heroSubheadlineFontSize as number}
                color={data.heroSubheadlineColor as string || "var(--muted-foreground)"}
                isEditing={true}
                onMove={(x, y, w) => {
                  onChange?.("heroSubheadlineX", x);
                  onChange?.("heroSubheadlineY", y);
                  onChange?.("heroSubheadlineWidth", w);
                }}
              >
                <p className="w-full text-center text-balance">
                  {data.heroSubheadline as string}
                </p>
              </CanvasTextBox>
            </>
          ) : (
            <>
              <StaticTextBox
                xPct={data.heroHeadlineX ?? 0}
                yPct={data.heroHeadlineY ?? 30}
                widthPct={data.heroHeadlineWidth ?? 100}
                fontSize={data.heroHeadlineFontSize as number}
                color={data.heroHeadlineColor as string || "var(--heading)"}
              >
                <h1 className="font-bold tracking-tight text-balance leading-tight w-full text-center">
                  {(data.heroHeadline as string)?.includes("drive results.") ? (
                    <>
                      We design and build products that{" "}
                      <span className="opacity-70">drive results.</span>
                    </>
                  ) : (
                    (data.heroHeadline as string)
                  )}
                </h1>
              </StaticTextBox>
              <StaticTextBox
                xPct={data.heroSubheadlineX ?? 0}
                yPct={data.heroSubheadlineY ?? 60}
                widthPct={data.heroSubheadlineWidth ?? 100}
                fontSize={data.heroSubheadlineFontSize as number}
                color={data.heroSubheadlineColor as string || "var(--muted-foreground)"}
              >
                <p className="w-full text-center text-balance">
                  {data.heroSubheadline as string}
                </p>
              </StaticTextBox>
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
}: {
  data: typeof initialGenericPageData & Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  isEditing?: boolean;
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

  const dataLoaded = !!containerSize.width && data.titleX !== undefined;
  useEffect(() => {
    if (dataLoaded) setRndKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  return (
    <div
      className={`flex flex-col w-full font-sans ${isEditing ? "select-none" : ""}`}
    >
      <section
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ minHeight: 400 }}
      >
        {data.headerBackgroundImage?.url ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${(data.headerBackgroundImage as unknown as Record<string, string>).url})`,
              }}
            />
            <div
              className="absolute inset-0 bg-background z-0 transition-all duration-200"
              style={getOverlayStyle(data.backgroundImageVisibility as number)}
            />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted/30" />
        )}

        <div className="absolute inset-0 z-10">
          {isEditing ? (
            <>
              <CanvasTextBox
                stableKey={`title-${rndKey}`}
                xPct={data.titleX ?? 0}
                yPct={data.titleY ?? 30}
                widthPct={data.titleWidth ?? 100}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                fontSize={data.titleFontSize as number}
                color={data.titleColor as string || "var(--heading)"}
                isEditing={true}
                onMove={(x, y, w) => {
                  onChange?.("titleX", x);
                  onChange?.("titleY", y);
                  onChange?.("titleWidth", w);
                }}
              >
                <h1 className="font-bold tracking-tight w-full text-center">
                  {(data.title as string) || "Page Title"}
                </h1>
              </CanvasTextBox>

              <CanvasTextBox
                stableKey={`subtitle-${rndKey}`}
                xPct={data.subtitleX ?? 0}
                yPct={data.subtitleY ?? 60}
                widthPct={data.subtitleWidth ?? 100}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                fontSize={data.subtitleFontSize as number}
                color={data.subtitleColor as string || "var(--muted-foreground)"}
                isEditing={true}
                onMove={(x, y, w) => {
                  onChange?.("subtitleX", x);
                  onChange?.("subtitleY", y);
                  onChange?.("subtitleWidth", w);
                }}
              >
                <p className="w-full text-center">
                  {(data.subtitle as string) || "Page subtitle goes here."}
                </p>
              </CanvasTextBox>
            </>
          ) : (
            <>
              <StaticTextBox
                xPct={data.titleX ?? 0}
                yPct={data.titleY ?? 30}
                widthPct={data.titleWidth ?? 100}
                fontSize={data.titleFontSize as number}
                color={data.titleColor as string || "var(--heading)"}
              >
                <h1 className="font-bold tracking-tight w-full text-center">
                  {(data.title as string) || "Page Title"}
                </h1>
              </StaticTextBox>
              <StaticTextBox
                xPct={data.subtitleX ?? 0}
                yPct={data.subtitleY ?? 60}
                widthPct={data.subtitleWidth ?? 100}
                fontSize={data.subtitleFontSize as number}
                color={data.subtitleColor as string || "var(--muted-foreground)"}
              >
                <p className="w-full text-center">
                  {(data.subtitle as string) || "Page subtitle goes here."}
                </p>
              </StaticTextBox>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ---------- Page editor (data loading / saving) ----------

const PageEditor = ({
  pageId,
  initialData,
  fetcher,
  PreviewComponent,
  title,
}: {
  pageId: string;
  initialData: Record<string, unknown>;
  fetcher: (id: string) => Promise<Record<string, unknown> | null>;
  PreviewComponent: React.ComponentType<{
    data: Record<string, unknown>;
    onChange?: (key: string, value: unknown) => void;
    isEditing?: boolean;
  }>;
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
      toast("Settings saved", {
        description: `The ${pageId} page content has been updated.`,
      });
    } catch {
      toast.error("Error saving", {
        description: "There was a problem saving your changes.",
      });
    }
  };

  if (!data)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading…</div>
    );

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
    {
      id: "home",
      label: "Home",
      initialData: initialHomePageData as unknown as Record<string, unknown>,
      Preview: HomePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: () => getHomePageData(),
    },
    {
      id: "services",
      label: "Services",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
    {
      id: "portfolio",
      label: "Portfolio",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
    {
      id: "process",
      label: "Process",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
    {
      id: "about",
      label: "About",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
    {
      id: "testimonials",
      label: "Testimonials",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
    {
      id: "posts",
      label: "Posts",
      initialData: initialGenericPageData as unknown as Record<string, unknown>,
      Preview: GenericPagePreview as React.ComponentType<{ data: Record<string, unknown>; onChange?: (key: string, value: unknown) => void; isEditing?: boolean }>,
      fetcher: (id: string) => getPageData(id),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">
          Edit static page content with real-time preview.
        </p>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          {pagesConfig.map((page) => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {pagesConfig.map((page) => (
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
