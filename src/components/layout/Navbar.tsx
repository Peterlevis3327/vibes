"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar({ siteName = "Agency." }: { siteName?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-300 bg-background ${isScrolled ? 'shadow-sm border-b' : 'border-b-transparent'}`}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight">{siteName}</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Our Work
          </Link>
          <Link href="/process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Process
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
          <Link href="/posts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Insights
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="hidden md:flex">
            <Button>Start a Project</Button>
          </Link>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Open mobile menu">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-1 mt-6">
                  {[
                    { href: "/services", label: "Services" },
                    { href: "/portfolio", label: "Our Work" },
                    { href: "/process", label: "Process" },
                    { href: "/about", label: "About" },
                    { href: "/testimonials", label: "Testimonials" },
                    { href: "/posts", label: "Insights" },
                  ].map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      onClick={() => setIsOpen(false)} 
                      className="group flex items-center justify-between px-4 py-4 rounded-xl hover:bg-muted/60 transition-all active:scale-[0.98]"
                    >
                      <span className="text-xl font-semibold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  <div className="pt-6 px-4">
                    <Link href="/contact" onClick={() => setIsOpen(false)}>
                      <Button size="lg" className="w-full text-base h-14 rounded-xl">Start a Project</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
