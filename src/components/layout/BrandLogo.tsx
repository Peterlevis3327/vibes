import Image from "next/image";

interface BrandLogoProps {
  siteName?: string;
  logoUrl?: string;
  className?: string;
  showStudioBadge?: boolean;
}

export function BrandLogo({
  siteName = "Tech254",
  logoUrl,
  className = "",
  showStudioBadge = true,
}: BrandLogoProps) {
  if (logoUrl) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <Image
          src={logoUrl}
          alt={siteName}
          width={32}
          height={32}
          className="h-8 w-auto object-contain"
        />
        <span className="font-bold text-xl tracking-tight">{siteName}</span>
      </div>
    );
  }

  const isTech254 = siteName.toLowerCase().trim() === "tech254";

  return (
    <div className={`group flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Geometric Brand Mark */}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5 stroke-current"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16" />
          <path d="M12 7v12" />
          <path d="M7 19h10" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background transition-transform duration-300 group-hover:scale-125" />
      </div>

      {/* Typography */}
      <div className="flex items-center gap-1.5">
        {isTech254 ? (
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors">
            Tech<span className="text-primary font-black ml-0.5">254</span>
          </span>
        ) : (
          <span className="text-xl font-bold tracking-tight text-foreground">{siteName}</span>
        )}

        {showStudioBadge && (
          <span className="hidden sm:inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Studio
          </span>
        )}
      </div>
    </div>
  );
}
