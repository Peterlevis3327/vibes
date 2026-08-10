"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDocumentVersions } from "@/lib/firebase/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { Image as ImageIcon } from "lucide-react";

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
  PreviewComponent: React.ComponentType<{ data: any }>,
  title: string,
  collectionName?: string,
  docId?: string
}) {
  const [data, setData] = useState(initialData);
  const [history, setHistory] = useState<any[]>([]); // local undo stack
  const [serverVersions, setServerVersions] = useState<any[]>([]);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [mediaLibraryKey, setMediaLibraryKey] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
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
          {Object.keys(data).map((key) => (
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
          ))}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="flex-1 bg-muted/30 overflow-y-auto">
        <div className="p-4 border-b bg-background sticky top-0 z-10 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
          <div className="flex gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
        <div className="bg-background shadow-lg mx-auto transform scale-[0.8] origin-top border">
          <div className="pointer-events-none">
            <PreviewComponent data={data} />
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
