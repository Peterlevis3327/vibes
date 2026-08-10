"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 md:max-w-[400px]">
      <div className="bg-background border rounded-2xl shadow-xl p-5 md:p-6 flex flex-col gap-4 relative animate-in slide-in-from-bottom-5 fade-in duration-500">
        <button 
          onClick={declineCookies} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div>
          <h3 className="font-semibold text-lg mb-2">We use cookies</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to improve your experience and analyze site traffic. 
            By clicking "Accept", you agree to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button onClick={acceptCookies} className="flex-1 rounded-xl">Accept</Button>
          <Button onClick={declineCookies} variant="outline" className="flex-1 rounded-xl">Decline</Button>
        </div>
      </div>
    </div>
  );
}
