"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDocumentVersions } from "@/lib/firebase/db";
import { History } from "lucide-react";

interface VersionHistoryPanelProps {
  collectionName: string;
  docId: string;
  onRestore: (versionData: any) => void;
}

export function VersionHistoryPanel({ collectionName, docId, onRestore }: VersionHistoryPanelProps) {
  const [serverVersions, setServerVersions] = useState<any[]>([]);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVersionsOpen && collectionName && docId) {
      // eslint-disable-next-line
      setIsLoading(true);
      getDocumentVersions(collectionName, docId).then(versions => {
        setServerVersions(versions);
        // eslint-disable-next-line
        setIsLoading(false);
      });
    }
  }, [isVersionsOpen, collectionName, docId]);

  const handleRestoreServerVersion = (version: any) => {
    // Exclude metadata fields added by the versioning system
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, archivedAt, ...versionData } = version;
    onRestore(versionData);
    setIsVersionsOpen(false);
  };

  return (
    <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
      <DialogTrigger 
        render={<Button variant="outline" size="sm" type="button" />}
      >
        <History className="w-4 h-4 mr-2" />
        Version History
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading versions...</p>
          ) : serverVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous versions found.</p>
          ) : (
            serverVersions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <div className="text-sm font-medium">
                    {v.archivedAt ? new Date(v.archivedAt.toMillis()).toLocaleString() : 'Unknown Date'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    Status: {v.status || 'Published'}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleRestoreServerVersion(v)}>Restore</Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
