"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

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
  coverImage?: { url: string; alt: string };
}

export default function PortfolioAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<{ url: string, alt: string } | null>(null);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({ status: "Draft", year: new Date().getFullYear().toString() });

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
        coverImage
      };
      
      await saveWithVersionHistory("portfolio", docId, projectData);
      
      toast("Project saved successfully");
      setIsDialogOpen(false);
      setCoverImage(null);
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
  };

  const openEditModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      setCoverImage(project.coverImage || null);
    } else {
      setCurrentProject({ status: "Draft", year: new Date().getFullYear().toString() });
      setCoverImage(null);
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
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
                  <Input 
                    placeholder="e.g. Web Development" 
                    value={currentProject.category || ""} 
                    onChange={e => setCurrentProject({...currentProject, category: e.target.value})}
                    required 
                  />
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
                <Input 
                  placeholder="Optional SEO Description" 
                  value={currentProject.seoDescription || ""} 
                  onChange={e => setCurrentProject({...currentProject, seoDescription: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImage ? (
                  <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage.url} alt={coverImage.alt} className="h-16 w-16 object-cover rounded" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{coverImage.url.split('/').pop()}</p>
                        <p className="text-xs text-muted-foreground">Alt: {coverImage.alt}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCoverImage(null)}>
                      Remove
                    </Button>
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
          onSelect={(url, alt) => {
            setCoverImage({ url, alt });
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
