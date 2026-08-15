import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getGlobalSettings } from "@/lib/firebase/db";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieBanner } from "@/components/CookieBanner";
import { StructuredData } from "@/components/layout/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
  return {
    title: settings.defaultSeoTitle || "Tech254 | Digital Product Studio",
    description: settings.defaultSeoDescription || "We design and build websites and apps that deliver concrete outcomes.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getGlobalSettings();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {settings.fontFamily && settings.fontFamily !== "Inter" && (
          <link 
            href={`https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`} 
            rel="stylesheet" 
          />
        )}
        {(settings.primaryColor || settings.secondaryColor || settings.textColor || settings.headingColor || settings.mutedTextColor || settings.fontFamily || settings.baseFontSize) && (
          <style>{`
            :root {
              ${settings.primaryColor ? `--primary: ${settings.primaryColor}; --primary-foreground: ${settings.primaryForeground || '#ffffff'};` : ''}
              ${settings.secondaryColor ? `--secondary: ${settings.secondaryColor}; --secondary-foreground: ${settings.secondaryForeground || '#0f172a'};` : ''}
              ${settings.textColor ? `--foreground: ${settings.textColor};` : ''}
              ${settings.headingColor ? `--heading: ${settings.headingColor};` : ''}
              ${settings.mutedTextColor ? `--muted-foreground: ${settings.mutedTextColor};` : ''}
            }
            .dark {
              ${settings.primaryColor ? `--primary: ${settings.primaryColor}; --primary-foreground: ${settings.primaryForeground || '#ffffff'};` : ''}
              ${settings.secondaryColor ? `--secondary: ${settings.secondaryColor}; --secondary-foreground: ${settings.secondaryForeground || '#0f172a'};` : ''}
              ${settings.textColor ? `--foreground: ${settings.textColor};` : ''}
              ${settings.headingColor ? `--heading: ${settings.headingColor};` : ''}
              ${settings.mutedTextColor ? `--muted-foreground: ${settings.mutedTextColor};` : ''}
            }
            html {
              ${settings.baseFontSize ? `font-size: ${settings.baseFontSize}px;` : ''}
              ${settings.fontFamily && settings.fontFamily !== "Inter" ? `--font-inter: '${settings.fontFamily}', sans-serif;` : ''}
            }
          `}</style>
        )}
        {settings.enableAnalytics && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
            strategy="afterInteractive"
          />
        )}
        {settings.enableAnalytics && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `}
          </Script>
        )}
        <StructuredData settings={settings} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar siteName={settings.siteName || "Tech254"} />
          <main className="flex-1">
            {children}
          </main>
          <Footer siteName={settings.siteName || "Tech254"} />
          <WhatsAppButton 
            phoneNumber={settings.whatsappNumber} 
            defaultMessage={settings.whatsappMessage} 
          />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
