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
import { getAllTeamMembers, saveWithVersionHistory, getPageData } from "@/lib/firebase/db";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: { url: string; alt: string; caption?: string; showCaption?: boolean };
  socialLinks?: { linkedin?: string; github?: string; twitter?: string; portfolioUrl?: string };
  roleColor?: string;
  status: "Draft" | "Published";
}

export default function TeamAdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [avatar, setAvatar] = useState<{ url: string, alt: string, caption?: string, showCaption?: boolean } | null>(null);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({ status: "Draft", socialLinks: {} });
  
  const [missionData, setMissionData] = useState<{
    missionTitle: string;
    missionText1: string;
    missionText2: string;
    missionImage?: { url: string; alt: string; caption?: string; showCaption?: boolean } | null;
  }>({ missionTitle: "", missionText1: "", missionText2: "", missionImage: null });
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [isMissionMediaOpen, setIsMissionMediaOpen] = useState(false);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    const data = await getAllTeamMembers();
    setTeamMembers(data as TeamMember[]);
    setIsLoading(false);
  };

  const fetchMissionData = async () => {
    const data = await getPageData("about");
    if (data) {
      setMissionData({
        missionTitle: data.missionTitle || "",
        missionText1: data.missionText1 || "",
        missionText2: data.missionText2 || "",
        missionImage: data.missionImage || null
      });
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchMissionData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "team", id));
      }
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      await revalidatePublicRoutes("team", id);
      toast("Team member deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete team member");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember.name) {
      toast.error("Name is required");
      return;
    }
    
    const docId = currentMember.id || currentMember.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    try {
      const memberData = {
        ...currentMember,
        avatar
      };
      
      await saveWithVersionHistory("team", docId, memberData);
      await revalidatePublicRoutes("team", docId);
      
      toast("Team member saved successfully");
      setIsDialogOpen(false);
      setCurrentMember({ status: "Draft", socialLinks: {} });
      setAvatar(null);
      fetchTeamMembers();
    } catch (error) {
      toast.error("Failed to save team member");
    }
  };

  const handleRestore = (versionData: any) => {
    setCurrentMember({
      ...currentMember,
      ...versionData
    });
    if (versionData.avatar) {
      setAvatar(versionData.avatar);
    }
  };

  const openEditModal = (member?: TeamMember) => {
    if (member) {
      setCurrentMember({ ...member, socialLinks: member.socialLinks || {} });
      setAvatar(member.avatar || null);
    } else {
      setCurrentMember({ status: "Draft", socialLinks: {} });
      setAvatar(null);
    }
    setIsDialogOpen(true);
  };

  const handleSaveMission = async () => {
    setIsSavingMission(true);
    try {
      const existingData = await getPageData("about") || {};
      const updatedData = { ...existingData, ...missionData };
      await saveWithVersionHistory("pages", "about", updatedData);
      await revalidatePublicRoutes("pages", "about");
      toast.success("Mission saved successfully");
    } catch (error) {
      toast.error("Failed to save mission");
    }
    setIsSavingMission(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team & Mission</h1>
        <p className="text-muted-foreground">Manage your company mission and team members.</p>
      </div>

      <div className="border rounded-lg bg-background p-6 space-y-4">
        <h2 className="text-xl font-semibold">Company Mission</h2>
        <div className="space-y-2">
          <Label>Mission Title</Label>
          <Input 
            placeholder="e.g. Our Mission" 
            value={missionData.missionTitle}
            onChange={(e) => setMissionData({ ...missionData, missionTitle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Mission Paragraph 1</Label>
          <Textarea 
            placeholder="First paragraph of the mission..." 
            value={missionData.missionText1}
            onChange={(e) => setMissionData({ ...missionData, missionText1: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Mission Paragraph 2</Label>
          <Textarea 
            placeholder="Second paragraph of the mission..." 
            value={missionData.missionText2}
            onChange={(e) => setMissionData({ ...missionData, missionText2: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Mission Image</Label>
          {missionData.missionImage ? (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={missionData.missionImage.url} alt={missionData.missionImage.alt} className="h-16 w-16 object-cover rounded-md" />
                  <div>
                    <p className="text-sm font-medium line-clamp-1 max-w-[200px]">{missionData.missionImage.url.split('/').pop()}</p>
                    <p className="text-xs text-muted-foreground">Alt: {missionData.missionImage.alt}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setMissionData({ ...missionData, missionImage: null })}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
              <p className="text-sm text-muted-foreground mb-4">Select an image for the mission section</p>
              <Button type="button" variant="outline" onClick={() => setIsMissionMediaOpen(true)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Open Media Library
              </Button>
            </div>
          )}
        </div>
        <Button onClick={handleSaveMission} disabled={isSavingMission}>
          {isSavingMission ? "Saving..." : "Save Mission"}
        </Button>

        <MediaLibraryModal 
          open={isMissionMediaOpen} 
          onOpenChange={setIsMissionMediaOpen}
          onSelect={(url, alt, caption) => {
            setMissionData({ ...missionData, missionImage: { url, alt, caption, showCaption: !!caption } });
          }}
        />
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <div>
          <h2 className="text-2xl font-semibold">Team Members</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    placeholder="e.g. Jane Doe" 
                    value={currentMember.name || ""} 
                    onChange={e => setCurrentMember({...currentMember, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={currentMember.status} onValueChange={(v: any) => setCurrentMember({...currentMember, status: v})}>
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
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Role</Label>
                  <Input 
                    placeholder="e.g. Lead Designer" 
                    value={currentMember.role || ""} 
                    onChange={e => setCurrentMember({...currentMember, role: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 w-24">
                  <Label>Role Color</Label>
                  <Input 
                    type="color"
                    className="h-10 w-full p-1 cursor-pointer"
                    value={currentMember.roleColor || "#000000"} 
                    onChange={e => setCurrentMember({...currentMember, roleColor: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea 
                  placeholder="Short biography..." 
                  value={currentMember.bio || ""} 
                  onChange={e => setCurrentMember({...currentMember, bio: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Links & Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input 
                      placeholder="https://linkedin.com/in/..." 
                      value={currentMember.socialLinks?.linkedin || ""} 
                      onChange={e => setCurrentMember({...currentMember, socialLinks: {...currentMember.socialLinks, linkedin: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input 
                      placeholder="https://github.com/..." 
                      value={currentMember.socialLinks?.github || ""} 
                      onChange={e => setCurrentMember({...currentMember, socialLinks: {...currentMember.socialLinks, github: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Portfolio / External Website URL</Label>
                  <Input 
                    placeholder="https://yourname.dev or external link..." 
                    value={currentMember.socialLinks?.portfolioUrl || ""} 
                    onChange={e => setCurrentMember({...currentMember, socialLinks: {...currentMember.socialLinks, portfolioUrl: e.target.value}})}
                  />
                </div>
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
                {currentMember.id ? (
                  <VersionHistoryPanel
                    collectionName="team"
                    docId={currentMember.id}
                    onRestore={handleRestore}
                  />
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Team Member</Button>
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
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${member.status === 'Published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(member)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
