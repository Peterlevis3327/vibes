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
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Timestamp, doc, deleteDoc } from "firebase/firestore";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { getAllPosts, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  date: any; // Can be string or Timestamp
  status: "Draft" | "Published";
  seoTitle?: string;
  seoDescription?: string;
}

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  
  // Format current date for default value as YYYY-MM-DD for date input
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({ status: "Draft", date: todayStr, content: "" });

  const fetchPosts = async () => {
    setIsLoading(true);
    const data = await getAllPosts();
    // Convert Timestamps to strings for display in the table
    const formattedData = data.map((p: any) => ({
      ...p,
      date: p.date?.toDate ? p.date.toDate().toISOString().split('T')[0] : p.date
    }));
    setPosts(formattedData as BlogPost[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "posts", id));
      }
      setPosts(posts.filter(p => p.id !== id));
      toast("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title) {
      toast.error("Title is required");
      return;
    }
    
    let docId = currentPost.id;
    if (!docId) {
      const baseSlug = currentPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      docId = await generateUniqueSlug("posts", baseSlug);
    }
    
    // Parse the date string into a Firestore Timestamp
    const timestampDate = currentPost.date ? Timestamp.fromDate(new Date(currentPost.date)) : Timestamp.now();
    
    try {
      const postData = {
        ...currentPost,
        date: timestampDate,
        coverImage
      };
      
      // Note: Using "posts" collection
      await saveWithVersionHistory("posts", docId, postData);
      await revalidatePublicRoutes("posts", docId);
      
      toast("Post saved successfully");
      setIsDialogOpen(false);
      setCurrentPost({ status: "Draft", date: todayStr, content: "" });
      setCoverImage(null);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  const handleRestore = (versionData: any) => {
    const restoredDate = versionData.date?.toDate ? versionData.date.toDate().toISOString().split('T')[0] : (versionData.date || todayStr);
    setCurrentPost({
      ...currentPost,
      ...versionData,
      date: restoredDate
    });
    if (versionData.coverImage) {
      setCoverImage(versionData.coverImage);
    }
  };

  const openEditModal = (post?: BlogPost) => {
    if (post) {
      setCurrentPost(post);
      setCoverImage(post.coverImage || null);
    } else {
      setCurrentPost({ status: "Draft", date: todayStr, content: "" });
      setCoverImage(null);
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Manage your blog articles and publications.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Post
          </Button>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Building Scalable Systems" 
                    value={currentPost.title || ""} 
                    onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentPost.status} onValueChange={(v: any) => setCurrentPost({...currentPost, status: v})}>
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
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    placeholder="e.g. Engineering" 
                    value={currentPost.category || ""} 
                    onChange={e => setCurrentPost({...currentPost, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input 
                    placeholder="e.g. Jane Doe" 
                    value={currentPost.author || ""} 
                    onChange={e => setCurrentPost({...currentPost, author: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={currentPost.date || todayStr} 
                    onChange={e => setCurrentPost({...currentPost, date: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea 
                  placeholder="Short summary for cards..." 
                  value={currentPost.excerpt || ""} 
                  onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <TipTapEditor 
                  content={currentPost.content || ""} 
                  onChange={(html) => setCurrentPost({...currentPost, content: html})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImage ? (
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImage.url} alt={coverImage.alt} className="h-16 w-16 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{coverImage.url.split('/').pop()}</p>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input 
                    placeholder="Optional SEO Title" 
                    value={currentPost.seoTitle || ""} 
                    onChange={e => setCurrentPost({...currentPost, seoTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea 
                    placeholder="Optional SEO Description" 
                    value={currentPost.seoDescription || ""} 
                    onChange={e => setCurrentPost({...currentPost, seoDescription: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                {currentPost.id ? (
                  <VersionHistoryPanel
                    collectionName="posts"
                    docId={currentPost.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Post</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <MediaLibraryModal 
          open={isMediaLibraryOpen} 
          onOpenChange={setIsMediaLibraryOpen}
          onSelect={(url, alt, caption) => {
            setCoverImage({ url, alt, caption, showCaption: !!caption });
          }}
        />
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${post.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {post.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(post)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
