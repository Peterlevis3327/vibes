"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer({ siteName = "Tech254" }: { siteName?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/plmhrauth")) return null;

  return (
    <footer className="border-t bg-muted/20">
      <div className="container px-4 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold">{siteName}</h3>
            <p className="text-sm text-muted-foreground">
              We design and build websites and apps that deliver concrete outcomes.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-medium mb-3 md:mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
              <li><Link href="/testimonials" className="hover:text-foreground">Testimonials</Link></li>
              <li><Link href="/posts" className="hover:text-foreground">Insights</Link></li>
              <li><Link href="/process" className="hover:text-foreground">Process</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-medium mb-3 md:mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-foreground">Web Development</Link></li>
              <li><Link href="/services" className="hover:text-foreground">Mobile App Development</Link></li>
              <li><Link href="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-medium mb-3 md:mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
             
              <li className="pt-1 md:pt-2">
                <Link href="/contact" className="font-medium text-foreground hover:underline">
                 <u>Get in touch</u> 
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 md:mt-12 md:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteName} All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
