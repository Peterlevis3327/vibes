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
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { getAllTestimonials, saveWithVersionHistory, getPortfolioProjects } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  quote: string;
  avatar?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  status: "Draft" | "Published";
  relatedProjectId?: string;
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [avatar, setAvatar] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({ status: "Draft" });

  const fetchData = async () => {
    setIsLoading(true);
    const [tData, pData] = await Promise.all([
      getAllTestimonials(),
      getPortfolioProjects()
    ]);
    setTestimonials(tData as Testimonial[]);
    setPortfolioProjects(pData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "testimonials", id));
      }
      setTestimonials(testimonials.filter(t => t.id !== id));
      toast("Testimonial deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTestimonial.clientName) {
      toast.error("Client name is required");
      return;
    }
    
    const docId = currentTestimonial.id || currentTestimonial.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    try {
      const clientName = currentTestimonial.clientName || (currentTestimonial as any).name || "";
      const clientRole = currentTestimonial.clientRole || (currentTestimonial as any).role || "";
      const clientCompany = currentTestimonial.clientCompany || (currentTestimonial as any).company || "";

      const testimonialData = {
        ...currentTestimonial,
        clientName,
        clientRole,
        clientCompany,
        name: clientName,
        role: clientRole,
        company: clientCompany,
        avatar
      };
      
      await saveWithVersionHistory("testimonials", docId, testimonialData);
      await revalidatePublicRoutes("testimonials", docId);
      
      toast("Testimonial saved successfully");
      setIsDialogOpen(false);
      setCurrentTestimonial({ status: "Draft" });
      setAvatar(null);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentTestimonial({
      ...currentTestimonial,
      ...versionData,
      clientName: versionData.clientName || versionData.name || "",
      clientRole: versionData.clientRole || versionData.role || "",
      clientCompany: versionData.clientCompany || versionData.company || "",
    });
    if (versionData.avatar) {
      setAvatar(versionData.avatar);
    }
  };

  const openEditModal = (testimonial?: any) => {
    if (testimonial) {
      setCurrentTestimonial({
        ...testimonial,
        clientName: testimonial.clientName || testimonial.name || "",
        clientRole: testimonial.clientRole || testimonial.role || "",
        clientCompany: testimonial.clientCompany || testimonial.company || "",
      });
      setAvatar(testimonial.avatar || null);
    } else {
      setCurrentTestimonial({ status: "Draft" });
      setAvatar(null);
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage client quotes and feedback.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input 
                    placeholder="e.g. John Smith" 
                    value={currentTestimonial.clientName || ""} 
                    onChange={e => setCurrentTestimonial({...currentTestimonial, clientName: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentTestimonial.status} onValueChange={(v: any) => setCurrentTestimonial({...currentTestimonial, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Related Project (Optional)</Label>
                  <Select 
                    value={currentTestimonial.relatedProjectId || "none"} 
                    onValueChange={(v: any) => setCurrentTestimonial({...currentTestimonial, relatedProjectId: v === "none" ? undefined : v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a related project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {portfolioProjects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {/* Empty space for balance or future fields */}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Role</Label>
                  <Input 
                    placeholder="e.g. CEO" 
                    value={currentTestimonial.clientRole || ""} 
                    onChange={e => setCurrentTestimonial({...currentTestimonial, clientRole: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Company</Label>
                  <Input 
                    placeholder="e.g. Acme Corp" 
                    value={currentTestimonial.clientCompany || ""} 
                    onChange={e => setCurrentTestimonial({...currentTestimonial, clientCompany: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea 
                  placeholder="What they said..." 
                  value={currentTestimonial.quote || ""} 
                  onChange={e => setCurrentTestimonial({...currentTestimonial, quote: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar Image</Label>
                {avatar ? (
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar.url} alt={avatar.alt} className="h-16 w-16 object-cover rounded-full" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{avatar.url.split('/').pop()}</p>
                          <p className="text-xs text-muted-foreground">Alt: {avatar.alt}</p>
                          {avatar.caption && (
                            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">Caption: {avatar.caption}</p>
                          )}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAvatar(null)}>
                        Remove
                      </Button>
                    </div>
                    {avatar.caption && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <input
                          type="checkbox"
                          id="showCaption"
                          checked={avatar.showCaption || false}
                          onChange={(e) => setAvatar({ ...avatar, showCaption: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="showCaption" className="font-normal text-sm cursor-pointer">
                          Show caption visibly under image on live site
                        </Label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop an image here, or click to browse</p>
                    <Button type="button" variant="outline" onClick={() => setIsMediaLibraryOpen(true)}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Open Media Library
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                {currentTestimonial.id ? (
                  <VersionHistoryPanel
                    collectionName="testimonials"
                    docId={currentTestimonial.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Testimonial</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <MediaLibraryModal 
          open={isMediaLibraryOpen} 
          onOpenChange={setIsMediaLibraryOpen}
          onSelect={(url, alt, caption) => {
            setAvatar({ url, alt, caption, showCaption: !!caption });
          }}
        />
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial: any) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">{testimonial.clientName || testimonial.name}</TableCell>
                <TableCell>{testimonial.clientCompany || testimonial.company}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${testimonial.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {testimonial.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(testimonial)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
