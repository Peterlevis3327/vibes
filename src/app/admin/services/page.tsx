"use client";

import { useState, useEffect } from "react";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getAllServices, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  screenshotImage?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  order?: number;
  timeline?: string;
  idealFor?: string;
  features: string[];
  status: "Draft" | "Published";
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [screenshotImage, setScreenshotImage] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  const [currentService, setCurrentService] = useState<Partial<Service>>({ status: "Draft", order: 0 });
  const [featuresInput, setFeaturesInput] = useState("");

  const fetchServices = async () => {
    setIsLoading(true);
    const data = await getAllServices();
    setServices(data as Service[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "services", id));
      }
      setServices(services.filter(s => s.id !== id));
      toast("Service deleted");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService.title) {
      toast.error("Title is required");
      return;
    }
    
    let docId = currentService.id;
    if (!docId) {
      const baseSlug = currentService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      docId = await generateUniqueSlug("services", baseSlug);
    }
    const featuresArray = featuresInput.split('\n').filter(f => f.trim().length > 0);
    
    try {
      const serviceData = {
        ...currentService,
        features: featuresArray,
        screenshotImage,
        order: Number(currentService.order) || 0
      };
      
      await saveWithVersionHistory("services", docId, serviceData);
      await revalidatePublicRoutes("services", docId);
      
      toast("Service saved successfully");
      setIsDialogOpen(false);
      setCurrentService({ status: "Draft", order: 0 });
      setFeaturesInput("");
      setScreenshotImage(null);
      fetchServices();
    } catch (error) {
      toast.error("Failed to save service");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentService({
      ...currentService,
      ...versionData
    });
    if (versionData.features) {
      setFeaturesInput(versionData.features.join('\n'));
    }
    if (versionData.screenshotImage) {
      setScreenshotImage(versionData.screenshotImage);
    }
  };

  const openEditModal = (service?: Service) => {
    if (service) {
      setCurrentService(service);
      setFeaturesInput(service.features?.join('\n') || "");
      setScreenshotImage(service.screenshotImage || null);
    } else {
      setCurrentService({ status: "Draft", order: 0 });
      setFeaturesInput("");
      setScreenshotImage(null);
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Title</Label>
                  <Input 
                    placeholder="e.g. Web Development" 
                    value={currentService.title || ""} 
                    onChange={e => setCurrentService({...currentService, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentService.status} onValueChange={(v: any) => setCurrentService({...currentService, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Category</Label>
                  <Select value={currentService.category || ""} onValueChange={(v: any) => setCurrentService({...currentService, category: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Application">Web Application</SelectItem>
                      <SelectItem value="Mobile Application">Mobile Application</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 1" 
                    value={currentService.order || 0} 
                    onChange={e => setCurrentService({...currentService, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Typical Timeline</Label>
                  <Input 
                    placeholder="e.g. 2-4 weeks" 
                    value={currentService.timeline || ""} 
                    onChange={e => setCurrentService({...currentService, timeline: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ideal For</Label>
                <Input 
                  placeholder="e.g. Startups, E-commerce..." 
                  value={currentService.idealFor || ""} 
                  onChange={e => setCurrentService({...currentService, idealFor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Screenshot Image</Label>
                  {screenshotImage ? (
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={screenshotImage.url} alt={screenshotImage.alt || "Screenshot"} className="h-16 w-24 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{screenshotImage.url.split('/').pop()}</p>
                            <p className="text-xs text-muted-foreground">Alt: {screenshotImage.alt}</p>
                            {screenshotImage.caption && (
                              <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">Caption: {screenshotImage.caption}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setIsMediaLibraryOpen(true)}>
                            Change
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setScreenshotImage(null)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {screenshotImage.caption && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <input
                            type="checkbox"
                            id="showCaption"
                            checked={screenshotImage.showCaption || false}
                            onChange={(e) => setScreenshotImage({ ...screenshotImage, showCaption: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="showCaption" className="font-normal text-sm cursor-pointer">
                            Show caption visibly under image on live site
                          </Label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 bg-muted flex items-center justify-center rounded border">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <Button type="button" variant="outline" onClick={() => setIsMediaLibraryOpen(true)}>
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea 
                  placeholder="Brief summary..." 
                  value={currentService.shortDescription || ""} 
                  onChange={e => setCurrentService({...currentService, shortDescription: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea 
                  placeholder="Detailed description..." 
                  value={currentService.fullDescription || ""} 
                  onChange={e => setCurrentService({...currentService, fullDescription: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Features (One per line)</Label>
                <Textarea 
                  placeholder="Feature 1&#10;Feature 2" 
                  value={featuresInput} 
                  onChange={e => setFeaturesInput(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input 
                  placeholder="Optional SEO Title" 
                  value={currentService.seoTitle || ""} 
                  onChange={e => setCurrentService({...currentService, seoTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea 
                  placeholder="Optional SEO Description" 
                  value={currentService.seoDescription || ""} 
                  onChange={e => setCurrentService({...currentService, seoDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                {currentService.id ? (
                  <VersionHistoryPanel
                    collectionName="services"
                    docId={currentService.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Service</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.sort((a, b) => (a.order || 0) - (b.order || 0)).map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.order || 0}</TableCell>
                <TableCell className="font-medium">{service.title}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${service.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {service.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(service)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MediaLibraryModal 
        open={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
        onSelect={(url, alt, caption) => {
          setScreenshotImage({ url, alt, caption, showCaption: !!caption });
          setIsMediaLibraryOpen(false);
        }}
      />
    </div>
  );
}
