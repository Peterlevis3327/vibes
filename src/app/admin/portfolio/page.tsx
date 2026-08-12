"use client";

import { useState } from "react";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { getAllPortfolioProjects, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

// Type for project state
interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  status: "Draft" | "Published";
  client?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  thumbnailImage?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  challenge?: string;
  approach?: string;
  outcome?: string;
  industry?: string;
  techStack?: string[]; // Array of strings, handled as comma-separated string in form
  liveLink?: string;
  galleryImages?: { url: string; alt: string; caption?: string; showCaption?: boolean }[];
}

// Helper to safely join tech stack array to string
const techStackToString = (stack?: string[]) => {
  return Array.isArray(stack) ? stack.join(", ") : "";
};

export default function PortfolioAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "thumbnail" | "gallery" | null>(null);
  const [coverImage, setCoverImage] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean }[]>([]);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({ status: "Draft", year: new Date().getFullYear().toString() });
  const [techStackInput, setTechStackInput] = useState("");

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await getAllPortfolioProjects();
    setProjects(data as Project[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "portfolio", id));
      }
      setProjects(projects.filter(p => p.id !== id));
      toast("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      toast.error("Cover image is required");
      return;
    }
    if (!currentProject.title || !currentProject.category) {
      toast.error("Title and category are required");
      return;
    }
    
    // Auto-generate a unique slug ID if none exists
    let docId = currentProject.id;
    if (!docId) {
      const baseSlug = currentProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      docId = await generateUniqueSlug("portfolio", baseSlug);
    }
    
    try {
      const projectData = {
        ...currentProject,
        coverImage,
        thumbnailImage,
        galleryImages,
        techStack: techStackInput.split(",").map(s => s.trim()).filter(Boolean)
      };
      
      await saveWithVersionHistory("portfolio", docId, projectData);
      await revalidatePublicRoutes("portfolio", docId);
      
      toast("Project saved successfully");
      setIsDialogOpen(false);
      setCoverImage(null);
      setThumbnailImage(null);
      setGalleryImages([]);
      setTechStackInput("");
      setCurrentProject({ status: "Draft", year: new Date().getFullYear().toString() });
      fetchProjects(); // Refresh the list
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentProject({
      ...currentProject,
      ...versionData
    });
    if (versionData.coverImage) {
      setCoverImage(versionData.coverImage);
    }
    if (versionData.thumbnailImage) {
      setThumbnailImage(versionData.thumbnailImage);
    }
    if (versionData.galleryImages) {
      setGalleryImages(versionData.galleryImages);
    } else {
      setGalleryImages([]);
    }
    if (versionData.techStack) {
      setTechStackInput(techStackToString(versionData.techStack));
    }
  };

  const openEditModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      setCoverImage(project.coverImage || null);
      setThumbnailImage(project.thumbnailImage || null);
      setGalleryImages(project.galleryImages || []);
      setTechStackInput(techStackToString(project.techStack));
    } else {
      setCurrentProject({ status: "Draft", year: new Date().getFullYear().toString() });
      setCoverImage(null);
      setThumbnailImage(null);
      setGalleryImages([]);
      setTechStackInput("");
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Projects</h1>
          <p className="text-muted-foreground">Manage your case studies and past work.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-8 py-4">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Info</h3>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input 
                    placeholder="e.g. E-commerce Replatform" 
                    value={currentProject.title || ""} 
                    onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={currentProject.category} onValueChange={(v: any) => setCurrentProject({...currentProject, category: v})}>
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
                  <Label>Status</Label>
                  <Select value={currentProject.status} onValueChange={(v: any) => setCurrentProject({...currentProject, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input 
                    placeholder="e.g. 2024" 
                    value={currentProject.year || ""} 
                    onChange={e => setCurrentProject({...currentProject, year: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input 
                    placeholder="e.g. Acme Corp" 
                    value={currentProject.client || ""} 
                    onChange={e => setCurrentProject({...currentProject, client: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input 
                    placeholder="e.g. Healthcare" 
                    value={currentProject.industry || ""} 
                    onChange={e => setCurrentProject({...currentProject, industry: e.target.value})}
                  />
                </div>
              </div>

              {/* Content & Story */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Content & Story</h3>
                <div className="space-y-2">
                  <Label>Short Description (Grid View)</Label>
                  <Textarea 
                    placeholder="A brief summary for the portfolio grid..." 
                    value={currentProject.description || ""} 
                    onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>The Challenge</Label>
                  <Textarea 
                    placeholder="What problem were we solving?" 
                    value={currentProject.challenge || ""} 
                    onChange={e => setCurrentProject({...currentProject, challenge: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>The Approach</Label>
                  <Textarea 
                    placeholder="How did we solve it?" 
                    value={currentProject.approach || ""} 
                    onChange={e => setCurrentProject({...currentProject, approach: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>The Outcome</Label>
                  <Textarea 
                    placeholder="What were the results?" 
                    value={currentProject.outcome || ""} 
                    onChange={e => setCurrentProject({...currentProject, outcome: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tech Stack</Label>
                    <Input 
                      placeholder="e.g. React, Next.js, Firebase (comma separated)" 
                      value={techStackInput} 
                      onChange={e => setTechStackInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Live Project Link</Label>
                    <Input 
                      placeholder="e.g. https://example.com" 
                      value={currentProject.liveLink || ""} 
                      onChange={e => setCurrentProject({...currentProject, liveLink: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">SEO Options</h3>
                <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input 
                  placeholder="Optional SEO Title" 
                  value={currentProject.seoTitle || ""} 
                  onChange={e => setCurrentProject({...currentProject, seoTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea 
                  placeholder="Optional SEO Description" 
                  value={currentProject.seoDescription || ""} 
                  onChange={e => setCurrentProject({...currentProject, seoDescription: e.target.value})}
                  rows={3}
                />
              </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Media</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cover Image (Required) <br/><span className="text-xs text-muted-foreground font-normal">Shown at the top of the detail page.</span></Label>
                    {coverImage ? (
                      <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={coverImage.url} alt={coverImage.alt} className="h-16 w-16 object-cover rounded" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1 max-w-[150px]">{coverImage.url.split('/').pop()}</p>
                              <p className="text-xs text-muted-foreground">Alt: {coverImage.alt}</p>
                              {coverImage.caption && (
                                <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">Caption: {coverImage.caption}</p>
                              )}
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setCoverImage(null)}>
                            Remove
                          </Button>
                        </div>
                        {coverImage.caption && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <input
                              type="checkbox"
                              id="showCaption"
                              checked={coverImage.showCaption || false}
                              onChange={(e) => setCoverImage({ ...coverImage, showCaption: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="showCaption" className="font-normal text-sm cursor-pointer">
                              Show caption on site
                            </Label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30 h-[140px] flex flex-col justify-center items-center">
                        <Button type="button" variant="outline" onClick={() => { setMediaTarget("cover"); setIsMediaLibraryOpen(true); }}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Open Media Library
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thumbnail Image (Optional) <br/><span className="text-xs text-muted-foreground font-normal">Shown on the grid. Falls back to Cover if empty.</span></Label>
                    {thumbnailImage ? (
                      <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumbnailImage.url} alt={thumbnailImage.alt} className="h-16 w-16 object-cover rounded" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1 max-w-[150px]">{thumbnailImage.url.split('/').pop()}</p>
                              <p className="text-xs text-muted-foreground">Alt: {thumbnailImage.alt}</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setThumbnailImage(null)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30 h-[140px] flex flex-col justify-center items-center">
                        <Button type="button" variant="outline" onClick={() => { setMediaTarget("thumbnail"); setIsMediaLibraryOpen(true); }}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Open Media Library
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Project Gallery (Optional)</h3>
                    <p className="text-sm text-muted-foreground">Add multiple images to display a gallery below the main case study.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setMediaTarget("gallery"); setIsMediaLibraryOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Image
                  </Button>
                </div>
                
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="border rounded-lg p-2 bg-muted/30 relative group">
                        <div className="aspect-[4/3] relative rounded overflow-hidden mb-2 border border-muted/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.alt} className="object-cover w-full h-full" />
                        </div>
                        <p className="text-xs font-medium truncate px-1">{img.url.split('/').pop()}</p>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setGalleryImages(galleryImages.filter((_, index) => index !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30 mt-4">
                    <p className="text-muted-foreground text-sm">No gallery images added yet.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                {currentProject.id ? (
                  <VersionHistoryPanel
                    collectionName="portfolio"
                    docId={currentProject.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Project</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <MediaLibraryModal 
          open={isMediaLibraryOpen} 
          onOpenChange={setIsMediaLibraryOpen}
          onSelect={(url, alt, caption) => {
            if (mediaTarget === "cover") {
              setCoverImage({ url, alt, caption, showCaption: !!caption });
            } else if (mediaTarget === "thumbnail") {
              setThumbnailImage({ url, alt, caption, showCaption: false });
            } else if (mediaTarget === "gallery") {
              setGalleryImages([...galleryImages, { url, alt, caption, showCaption: !!caption }]);
            }
          }}
        />
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>{project.year}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-600">
                    {project.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(project)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
