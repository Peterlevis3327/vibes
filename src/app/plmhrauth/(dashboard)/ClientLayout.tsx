"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Briefcase, Settings, Users, LogOut, MessageSquareQuote, Layers, GitMerge } from "lucide-react";
import { signOut, auth } from "@/lib/firebase/client";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/plmhrauth/login") {
      router.push("/plmhrauth/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Don't wrap the login page in the dashboard layout
  if (pathname === "/plmhrauth/login") {
    return <>{children}</>;
  }

  if (!user) return null;

  const navItems = [
    { href: "/plmhrauth", label: "Dashboard", icon: LayoutDashboard },
    { href: "/plmhrauth/pages", label: "Pages", icon: FileText },
    { href: "/plmhrauth/services", label: "Services", icon: Layers },
    { href: "/plmhrauth/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/plmhrauth/process", label: "Process", icon: GitMerge },
    { href: "/plmhrauth/posts", label: "Posts", icon: FileText },
    { href: "/plmhrauth/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { href: "/plmhrauth/team", label: "Team", icon: Users },
    { href: "/plmhrauth/faqs", label: "FAQs", icon: FileText },
    { href: "/plmhrauth/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 border-b">
          <Link href="/plmhrauth" className="font-bold text-xl tracking-tight">
            Tech254 CMS
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => signOut(auth)} 
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b bg-background flex items-center px-8 sticky top-0 z-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 bg-muted rounded-full font-medium">
              {isAdmin ? "Admin" : "Editor"}
            </span>
            <div className="text-sm font-medium text-muted-foreground">
              {user.email}
            </div>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
