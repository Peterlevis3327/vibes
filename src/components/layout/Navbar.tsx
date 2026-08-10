"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          <span className="font-bold text-xl tracking-tight">Agency.</span>
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
            <Sheet>
              <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Open mobile menu">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-6 mt-8">
                  <Link href="/services" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Services
                  </Link>
                  <Link href="/portfolio" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Our Work
                  </Link>
                  <Link href="/process" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Process
                  </Link>
                  <Link href="/about" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                  <Link href="/testimonials" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Testimonials
                  </Link>
                  <Link href="/posts" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Insights
                  </Link>
                  <Link href="/contact">
                    <Button className="w-full mt-4">Start a Project</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
