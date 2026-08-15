import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-24 text-center bg-background">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-muted">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Page not found</h2>
        <p className="text-lg text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="h-12 px-8 rounded-full w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full w-full sm:w-auto">
              <FolderOpen className="mr-2 h-4 w-4" /> View Portfolio
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" /> Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
