"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { personalDb } from "@/lib/firebase/personalPortfolio";
import { getAllPortfolioProjects, saveWithVersionHistory, generateUniqueSlug } from "@/lib/firebase/db";

// Personal portfolio types
type ProjectCategory = 'web-app' | 'mobile-app' | 'desktop-app' | 'ai-ml' | 'full-stack' | 'other';

interface PersonalProject {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  technologies: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  downloadUrl?: string;
  image?: string;
  category: ProjectCategory;
  status: 'completed' | 'in-progress' | 'planned';
  featured: boolean;
}

export default function ImportPortfolioPage() {
  const router = useRouter();
  const [personalProjects, setPersonalProjects] = useState<PersonalProject[]>([]);
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch from Personal Portfolio
        const portfolioRef = doc(personalDb, 'portfolio', 'portfolio-data');
        const snapshot = await getDoc(portfolioRef);
        let pProjects: PersonalProject[] = [];
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.projects && Array.isArray(data.projects)) {
            pProjects = data.projects;
          }
        }
        
        setPersonalProjects(pProjects);

        // 2. Fetch from Tech254 Portfolio to check already imported
        const tech254Projects = await getAllPortfolioProjects();
        const importedIds = new Set<string>();
        tech254Projects.forEach(p => {
          if (p.importedFromId) {
            importedIds.add(p.importedFromId);
          }
        });
        setExistingIds(importedIds);
        
      } catch (error) {
        console.error("Failed to load projects", error);
        toast.error("Failed to load personal projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImport = async (project: PersonalProject) => {
    try {
      setIsImporting(project.id);
      
      // 1. Generate unique slug
      const baseSlug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const docId = await generateUniqueSlug("portfolio", baseSlug);

      // 2. Map category
      let mappedCategory = "";
      if (project.category === "web-app") mappedCategory = "Web Application";
      else if (project.category === "mobile-app") mappedCategory = "Mobile Application";
      
      // 3. Map descriptions
      let combinedDescription = project.shortDescription;
      if (project.fullDescription && project.fullDescription !== project.shortDescription) {
        combinedDescription += "\n\n" + project.fullDescription;
      }

      // 4. Construct image object
      const imageObj = project.image ? {
        url: project.image,
        alt: project.title,
        caption: "",
        showCaption: false
      } : null;

      // 5. Construct Tech254 project data
      const mappedData = {
        title: project.title,
        category: mappedCategory,
        year: new Date().getFullYear().toString(),
        status: "Draft",
        description: combinedDescription,
        techStack: project.technologies || [],
        liveLink: project.liveUrl || "",
        coverImage: imageObj,
        thumbnailImage: imageObj,
        importedFromId: project.id
      };

      // 6. Save to Tech254
      await saveWithVersionHistory("portfolio", docId, mappedData);
      
      toast.success(`${project.title} imported successfully!`);
      
      // Redirect to the portfolio admin page and auto-open the edit modal
      router.push(`/plmhrauth/portfolio?edit=${docId}`);
      
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Failed to import project");
      setIsImporting(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading personal projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plmhrauth/portfolio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Projects</h1>
          <p className="text-muted-foreground">Select projects from your personal portfolio to import into Tech254 as drafts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalProjects.length === 0 ? (
          <div className="col-span-full p-12 text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No projects found in the personal portfolio.</p>
          </div>
        ) : (
          personalProjects.map(project => {
            const isImported = existingIds.has(project.id);
            const importingThis = isImporting === project.id;
            
            return (
              <Card key={project.id} className={`overflow-hidden transition-all ${isImported ? 'opacity-70 bg-muted/30' : 'hover:shadow-md'}`}>
                <div className="aspect-video w-full relative bg-muted flex items-center justify-center border-b">
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-sm">No Image</span>
                  )}
                  {isImported && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                      <span className="font-medium text-sm">Already Imported</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {project.shortDescription}
                  </p>
                  
                  <Button 
                    className="w-full" 
                    variant={isImported ? "secondary" : "default"}
                    disabled={isImported || isImporting !== null}
                    onClick={() => handleImport(project)}
                  >
                    {importingThis ? (
                      "Importing..."
                    ) : isImported ? (
                      "Imported"
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" /> Import as Draft
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
