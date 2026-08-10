"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber: string;
  defaultMessage: string;
}

export function WhatsAppButton({ phoneNumber, defaultMessage }: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show after a small delay so it doesn't pop up immediately on page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || isDismissed || !phoneNumber) return null;

  // Format phone number (remove any non-digits, ensure it starts with country code, usually just standard wa.me format)
  const formattedNumber = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(defaultMessage);
  const waLink = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Button 
        variant="outline" 
        size="icon"
        className="h-8 w-8 rounded-full bg-background shadow-md border-muted text-muted-foreground hover:text-foreground"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss WhatsApp button</span>
      </Button>
      
      <a 
        href={waLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-colors font-medium"
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="hidden sm:inline">Chat with us</span>
      </a>
    </div>
  );
}
