"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllFaqs, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
  status: "Draft" | "Published";
}

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<Partial<FAQ>>({ status: "Draft", order: 0 });

  const fetchFaqs = async () => {
    setIsLoading(true);
    const data = await getAllFaqs();
    setFaqs(data as FAQ[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "faqs", id));
      }
      setFaqs(faqs.filter(s => s.id !== id));
      toast("FAQ deleted");
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaq.question) {
      toast.error("Question is required");
      return;
    }
    
    let docId = currentFaq.id;
    if (!docId) {
      const baseSlug = currentFaq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      docId = await generateUniqueSlug("faqs", baseSlug);
    }
    
    try {
      const faqData = {
        ...currentFaq,
        order: Number(currentFaq.order) || 0
      };
      
      await saveWithVersionHistory("faqs", docId, faqData);
      
      toast("FAQ saved successfully");
      setIsDialogOpen(false);
      setCurrentFaq({ status: "Draft", order: 0 });
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to save FAQ");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentFaq({
      ...currentFaq,
      ...versionData
    });
  };

  const openEditModal = (faq?: FAQ) => {
    if (faq) {
      setCurrentFaq(faq);
    } else {
      setCurrentFaq({ status: "Draft", order: 0 });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">Manage your Frequently Asked Questions.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentFaq.id ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input 
                  placeholder="e.g. How long does a project take?" 
                  value={currentFaq.question || ""} 
                  onChange={e => setCurrentFaq({...currentFaq, question: e.target.value})}
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 1" 
                    value={currentFaq.order || 0} 
                    onChange={e => setCurrentFaq({...currentFaq, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentFaq.status} onValueChange={(v: any) => setCurrentFaq({...currentFaq, status: v})}>
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
              
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea 
                  placeholder="Detailed answer..." 
                  value={currentFaq.answer || ""} 
                  onChange={e => setCurrentFaq({...currentFaq, answer: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {currentFaq.id ? (
                  <VersionHistoryPanel
                    collectionName="faqs"
                    docId={currentFaq.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save FAQ</Button>
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
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.sort((a, b) => (a.order || 0) - (b.order || 0)).map((faq) => (
              <TableRow key={faq.id}>
                <TableCell>{faq.order || 0}</TableCell>
                <TableCell className="font-medium">{faq.question}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${faq.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {faq.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(faq)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {faqs.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No FAQs found. Create your first FAQ above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
