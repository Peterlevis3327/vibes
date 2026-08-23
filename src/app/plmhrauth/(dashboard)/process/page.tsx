"use client";

import { useState, useEffect } from "react";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllProcessSteps, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

interface ProcessStep {
  id: string;
  title: string;
  duration: string;
  desc: string;
  deliverables: string[];
  order?: number;
  status: "Draft" | "Published";
}

export default function ProcessAdminPage() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Partial<ProcessStep>>({ status: "Draft", order: 0 });
  const [deliverablesInput, setDeliverablesInput] = useState("");

  const fetchSteps = async () => {
    setIsLoading(true);
    const data = await getAllProcessSteps();
    setSteps(data as ProcessStep[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSteps();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this process step?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "process", id));
      }
      setSteps(steps.filter(s => s.id !== id));
      toast("Process step deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete process step");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStep.title) {
      toast.error("Title is required");
      return;
    }
    
    let docId = currentStep.id;
    if (!docId) {
      const baseSlug = currentStep.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      docId = await generateUniqueSlug("process", baseSlug);
    }
    const deliverablesArray = deliverablesInput.split('\n').filter(f => f.trim().length > 0);
    
    try {
      const stepData = {
        ...currentStep,
        deliverables: deliverablesArray,
        order: Number(currentStep.order) || 0
      };
      
      await saveWithVersionHistory("process", docId, stepData);
      await revalidatePublicRoutes("process", docId);
      
      toast("Process step saved successfully");
      setIsDialogOpen(false);
      setCurrentStep({ status: "Draft", order: 0 });
      setDeliverablesInput("");
      fetchSteps();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to save process step");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentStep({
      ...currentStep,
      ...versionData
    });
    if (versionData.deliverables) {
      setDeliverablesInput(versionData.deliverables.join('\n'));
    }
  };

  const openEditModal = (step?: ProcessStep) => {
    if (step) {
      setCurrentStep(step);
      setDeliverablesInput(step.deliverables?.join('\n') || "");
    } else {
      setCurrentStep({ status: "Draft", order: 0 });
      setDeliverablesInput("");
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Process Steps</h1>
          <p className="text-muted-foreground">Manage your methodology steps.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentStep.id ? "Edit Step" : "Add New Step"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Step Title</Label>
                  <Input 
                    placeholder="e.g. Discovery & Scoping" 
                    value={currentStep.title || ""} 
                    onChange={e => setCurrentStep({...currentStep, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input 
                    placeholder="e.g. 1-2 Weeks" 
                    value={currentStep.duration || ""} 
                    onChange={e => setCurrentStep({...currentStep, duration: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 1" 
                    value={currentStep.order || 0} 
                    onChange={e => setCurrentStep({...currentStep, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentStep.status} onValueChange={(v: any) => setCurrentStep({...currentStep, status: v})}>
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
                <Label>Description</Label>
                <Textarea 
                  placeholder="Detailed description of this phase..." 
                  value={currentStep.desc || ""} 
                  onChange={e => setCurrentStep({...currentStep, desc: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Key Deliverables (One per line)</Label>
                <Textarea 
                  placeholder="Project Brief&#10;Timeline & Milestones" 
                  value={deliverablesInput} 
                  onChange={e => setDeliverablesInput(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {currentStep.id ? (
                  <VersionHistoryPanel
                    collectionName="process"
                    docId={currentStep.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Step</Button>
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
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.sort((a, b) => (a.order || 0) - (b.order || 0)).map((step) => (
              <TableRow key={step.id}>
                <TableCell>{step.order || 0}</TableCell>
                <TableCell className="font-medium">{step.title}</TableCell>
                <TableCell className="text-muted-foreground">{step.duration}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${step.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {step.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(step)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(step.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {steps.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No process steps found. Create your first step above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
