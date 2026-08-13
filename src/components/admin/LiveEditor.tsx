"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDocumentVersions } from "@/lib/firebase/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { Image as ImageIcon, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { getContrastRatio, getLuminance } from "@/lib/utils/colorUtils";

function ColorControl({ value, onChange, hasBackgroundImage }: { value: string, onChange: (val: string) => void, hasBackgroundImage?: boolean }) {
  const [showCustom, setShowCustom] = useState(false);
  const brandColors = [
    { label: "Dark (Heading)", hex: "#0f172a", value: "var(--heading)" },
    { label: "Light (Background)", hex: "#ffffff", value: "var(--background)" },
    { label: "Muted", hex: "#64748b", value: "var(--muted-foreground)" },
    { label: "Primary", hex: "#3b82f6", value: "var(--primary)" },
  ];

  const [resolvedValue, setResolvedValue] = useState(value);

  useEffect(() => {
    if (value?.startsWith('var(')) {
      // Extract variable name, e.g., var(--primary) -> --primary
      const varMatch = value.match(/var\((--[^)]+)\)/);
      if (varMatch && varMatch[1]) {
        // Read from document.body or documentElement where variables are injected
        const computed = getComputedStyle(document.body).getPropertyValue(varMatch[1]).trim();
        if (computed) {
          // ensure we pad hex if it returns something weird, though usually it's hex or rgb
          setResolvedValue(computed);
        } else {
          setResolvedValue(value);
        }
      }
    } else {
      setResolvedValue(value);
    }
  }, [value]);

  // Contrast against typical background (light overlay or dark overlay)
  const contrast = resolvedValue ? getContrastRatio(getLuminance(resolvedValue), getLuminance("#ffffff")) : 21;
  const showWarning = contrast < 4.5 && resolvedValue !== "";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-xs">Text Color</Label>
        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowCustom(!showCustom)}>
          {showCustom ? "Use Brand Palette" : "Custom Hex"}
        </Button>
      </div>

      {!showCustom ? (
        <div className="flex gap-2 flex-wrap">
          {brandColors.map(c => (
            <button 
              key={c.hex} 
              type="button"
              onClick={() => onChange(c.value)}
              className={`h-8 w-8 rounded-full border border-border transition-all ${value === c.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onChange("")}>Default</Button>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <input 
            type="color" 
            value={value?.startsWith('var(') ? "#ffffff" : (value || "#ffffff")} 
            onChange={(e) => onChange(e.target.value)} 
            className="h-8 w-14 cursor-pointer rounded border"
          />
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="#hex"
            className="h-8 flex-1 text-sm"
          />
        </div>
      )}
      
      {hasBackgroundImage ? (
        <div className="flex items-start gap-2 text-muted-foreground text-xs mt-1 bg-muted/30 p-2 rounded border">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>Background image present — contrast can't be automatically verified. Use the mobile/desktop preview to check readability visually, and increase the "Visibility" slider to dim the background if needed.</span>
        </div>
      ) : showWarning && value !== "" ? (
        <div className="flex items-start gap-2 text-amber-600 text-xs mt-1 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>Low contrast against the baseline background color.</span>
        </div>
      ) : null}
    </div>
  );
}

// A generic wrapper component that provides a split view for editing page content
export function LiveEditor({ 
  initialData, 
  onSave, 
  PreviewComponent, 
  title,
  collectionName,
  docId
}: { 
  initialData: any, 
  onSave: (data: any) => void, 
  PreviewComponent: React.ComponentType<{ data: any, onChange?: (key: string, value: any) => void, isEditing?: boolean }>,
  title: string,
  collectionName?: string,
  docId?: string
}) {
  const [data, setData] = useState(initialData);
  const [history, setHistory] = useState<any[]>([]); // local undo stack
  const [serverVersions, setServerVersions] = useState<any[]>([]);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [mediaLibraryKey, setMediaLibraryKey] = useState<string | null>(null);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  const handleChange = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save current state to history before saving
    setHistory(prev => [...prev, data]);
    onSave(data);
  };

  const handleRestore = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setData(previous);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (isVersionsOpen && collectionName && docId) {
      getDocumentVersions(collectionName, docId).then(setServerVersions);
    }
  }, [isVersionsOpen, collectionName, docId]);

  const handleRestoreServerVersion = (version: any) => {
    // Keep local undo history before restoring server version
    setHistory(prev => [...prev, data]);
    const { id, archivedAt, ...versionData } = version;
    setData(versionData);
    setIsVersionsOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-8 border-t">
      {/* Editor Panel */}
      <div className="w-[400px] border-r bg-background flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-muted/10">
          <h2 className="font-semibold">{title} Editor</h2>
          <div className="flex gap-2">
            {collectionName && docId && (
              <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
                <DialogTrigger 
                  render={<Button size="sm" variant="outline" title="View Server History" />}
                >
                  History
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Version History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {serverVersions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No previous versions found.</p>
                    ) : (
                      serverVersions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="text-sm">
                            {v.archivedAt ? new Date(v.archivedAt.toMillis()).toLocaleString() : 'Unknown Date'}
                          </div>
                          <Button size="sm" onClick={() => handleRestoreServerVersion(v)}>Restore</Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button size="sm" variant="outline" onClick={handleRestore} disabled={history.length === 0} title="Undo local change">
              Undo
            </Button>
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {Object.keys(data).map((key) => {
            if (key.endsWith('X') || key.endsWith('Y')) return null;

            return (
              <div key={key} className="space-y-2">
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
              {typeof data[key] === 'object' && data[key] !== null ? (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                  {data[key]?.url ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data[key].url} alt={data[key].alt || ""} className="h-16 w-16 object-cover rounded-lg border" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1 max-w-[150px]" title={data[key].url.split('/').pop()}>{data[key].url.split('/').pop()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setMediaLibraryKey(key)}>
                          Change
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleChange(key, { url: "", alt: "" })} className="text-destructive">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg bg-background/50">
                      <Button type="button" variant="outline" onClick={() => setMediaLibraryKey(key)}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
              ) : typeof data[key] === 'boolean' ? (
                <div className="flex items-center space-x-2 h-10 border rounded-lg px-4 bg-muted/30">
                  <Switch 
                    checked={data[key]} 
                    onCheckedChange={(checked) => handleChange(key, checked)} 
                  />
                  <span className="text-sm font-medium">{data[key] ? "Enabled" : "Disabled"}</span>
                </div>
              ) : typeof data[key] === 'number' && key.toLowerCase().includes('visibility') ? (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                     <span>Subtle</span>
                     <span>Vivid</span>
                  </div>
                  <Slider 
                    value={[data[key]]} 
                    max={100} 
                    step={1} 
                    onValueChange={(val: any) => handleChange(key, Array.isArray(val) ? val[0] : val)} 
                  />
                </div>
              ) : key.toLowerCase().includes('color') ? (
                <div key={key} className="space-y-4 border rounded-lg p-4 bg-muted/30">
                   <Label className="capitalize font-semibold text-base">
                     {key.replace('Color', '')} Styling & Position
                   </Label>
                   <ColorControl 
                      value={data[key]} 
                      onChange={(val) => handleChange(key, val)} 
                      hasBackgroundImage={!!(data.heroBackgroundImage?.url || data.headerBackgroundImage?.url)}
                   />
                   
                   {/* Numeric Inputs */}
                   <div className="flex gap-2 items-center flex-wrap">
                      <div className="flex-1 min-w-[45%] space-y-1">
                        <Label className="text-xs">Left X (%)</Label>
                        <Input type="number" min={0} max={100} value={data[`${key.replace('Color', '')}X`] ?? 50} onChange={(e) => handleChange(`${key.replace('Color', '')}X`, Number(e.target.value))} />
                      </div>
                      <div className="flex-1 min-w-[45%] space-y-1">
                        <Label className="text-xs">Top Y (%)</Label>
                        <Input type="number" min={0} max={100} value={data[`${key.replace('Color', '')}Y`] ?? 50} onChange={(e) => handleChange(`${key.replace('Color', '')}Y`, Number(e.target.value))} />
                      </div>
                      <div className="flex-1 min-w-[45%] space-y-1">
                        <Label className="text-xs">Width (%)</Label>
                        <Input type="number" min={10} max={100} value={data[`${key.replace('Color', '')}Width`] ?? 100} onChange={(e) => handleChange(`${key.replace('Color', '')}Width`, Math.max(10, Number(e.target.value)))} />
                      </div>
                      <div className="flex-1 min-w-[45%] space-y-1">
                        <Label className="text-xs">Height (%)</Label>
                        <Input type="number" min={10} max={100} value={data[`${key.replace('Color', '')}Height`] ?? 100} onChange={(e) => handleChange(`${key.replace('Color', '')}Height`, Math.max(10, Number(e.target.value)))} />
                      </div>
                   </div>
                   <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      handleChange(`${key.replace('Color', '')}X`, 50);
                      handleChange(`${key.replace('Color', '')}Y`, 50);
                   }}>Reset to Center</Button>
                </div>
              ) : typeof data[key] === 'string' && (data[key].length > 100 || key.toLowerCase().includes('description') || key.toLowerCase().includes('headline')) ? (
                <Textarea 
                  value={data[key]} 
                  onChange={(e) => handleChange(key, e.target.value)} 
                  rows={4}
                />
              ) : (
                <Input 
                  value={data[key]} 
                  onChange={(e) => handleChange(key, e.target.value)} 
                />
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="flex-1 bg-muted/30 overflow-y-auto">
        <div className="p-4 border-b bg-background sticky top-0 z-10 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 mr-4 border rounded-md p-1 bg-muted/50">
               <Button variant={!isPreviewMobile ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-3" onClick={() => setIsPreviewMobile(false)}>Desktop</Button>
               <Button variant={isPreviewMobile ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-3" onClick={() => setIsPreviewMobile(true)}>Mobile</Button>
            </div>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live Sync Active"></span>
          </div>
        </div>
        <div className={`bg-background shadow-lg mx-auto transform origin-top border transition-all duration-300 ${isPreviewMobile ? 'w-[375px] mt-8 min-h-[667px]' : 'w-full scale-[0.8]'}`}>
          <div className="relative w-full h-full">
            <PreviewComponent data={data} onChange={handleChange} isEditing={true} />
          </div>
        </div>
      </div>

      <MediaLibraryModal 
        open={mediaLibraryKey !== null} 
        onOpenChange={(open) => { if (!open) setMediaLibraryKey(null); }}
        onSelect={(url, alt, caption) => {
          if (mediaLibraryKey) {
            handleChange(mediaLibraryKey, { url, alt, caption, showCaption: data[mediaLibraryKey]?.showCaption || false });
            setMediaLibraryKey(null);
          }
        }}
      />
    </div>
  );
}
