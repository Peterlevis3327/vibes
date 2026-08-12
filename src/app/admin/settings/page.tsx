"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { revalidatePublicRoutes } from "@/app/actions/revalidate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Helper to calculate relative luminance
function getLuminance(hex: string) {
  const rgb = hex.replace(/^#/, '');
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;
  
  const [R, G, B] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Helper to calculate contrast ratio between two relative luminances
function getContrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Auto-compute foreground (white or dark slate) based on background hex
function getOptimalForeground(bgHex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#ffffff";
  const bgLum = getLuminance(bgHex);
  const whiteLum = 1; // #ffffff
  const darkLum = getLuminance("#0f172a"); // slate-900
  
  const contrastWithWhite = getContrastRatio(bgLum, whiteLum);
  const contrastWithDark = getContrastRatio(bgLum, darkLum);
  
  // Return white if it meets AA (4.5), OR if it's better than dark
  return (contrastWithWhite >= 4.5 || contrastWithWhite > contrastWithDark) ? "#ffffff" : "#0f172a";
}

function getContrastString(bgHex: string, fgHex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "0.00";
  return getContrastRatio(getLuminance(bgHex), getLuminance(fgHex)).toFixed(2);
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Agency.",
    primaryColor: "#0f172a",
    secondaryColor: "#f1f5f9",
    headingColor: "",
    textColor: "",
    mutedTextColor: "",
    enableAnalytics: false,
    defaultSeoTitle: "Agency | Digital Product Studio",
    defaultSeoDescription: "We design and build websites and apps that deliver concrete outcomes.",
    whatsappNumber: "+1234567890",
    whatsappMessage: "Hi, I'm interested in working with you!",
  });

  const primaryForeground = getOptimalForeground(settings.primaryColor);
  const secondaryForeground = getOptimalForeground(settings.secondaryColor);
  
  const primaryContrast = parseFloat(getContrastString(settings.primaryColor, primaryForeground));
  const secondaryContrast = parseFloat(getContrastString(settings.secondaryColor, secondaryForeground));
  
  const isPrimaryPassing = primaryContrast >= 4.5;
  const isSecondaryPassing = secondaryContrast >= 4.5;
  const isPassing = isPrimaryPassing && isSecondaryPassing;

  useEffect(() => {
    async function fetchSettings() {
      try {
        if (!db) return;
        // In the db.ts fetcher, we query the settings collection, taking the first doc.
        // Let's assume the doc ID is 'global' for simplicity.
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!db) return;
      const settingsToSave = {
        ...settings,
        primaryForeground: getOptimalForeground(settings.primaryColor),
        secondaryForeground: getOptimalForeground(settings.secondaryColor)
      };
      const docRef = doc(db, "settings", "global");
      await setDoc(docRef, settingsToSave, { merge: true });
      await revalidatePublicRoutes("settings", "global");
      alert("Settings saved successfully.");
      // In a real app we'd use a toast notification
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage global configuration and brand elements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Identity & SEO</CardTitle>
          <CardDescription>Configure the main branding and search engine optimization settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="siteName">Site Name / Logo Text</Label>
            <Input 
              id="siteName"
              value={settings.siteName || ""}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="Agency."
            />
            <p className="text-sm text-muted-foreground">This text appears in the navigation bar and footer.</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="defaultSeoTitle">Default SEO Title</Label>
            <Input 
              id="defaultSeoTitle"
              value={settings.defaultSeoTitle || ""}
              onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              placeholder="Agency | Digital Product Studio"
            />
            <p className="text-sm text-muted-foreground">The default title shown in browser tabs and search engine results.</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="defaultSeoDescription">Default SEO Description</Label>
            <Input 
              id="defaultSeoDescription"
              value={settings.defaultSeoDescription || ""}
              onChange={(e) => setSettings({ ...settings, defaultSeoDescription: e.target.value })}
              placeholder="We design and build websites and apps..."
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Identity Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Assets</CardTitle>
          <CardDescription>Configure the primary colors used across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="primaryColor">Primary Accent Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                id="primaryColor"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-32 font-mono"
              />
            </div>
            
            {isPrimaryPassing ? (
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center justify-center px-6 py-2 rounded-md font-medium text-sm shadow-sm"
                    style={{ backgroundColor: settings.primaryColor, color: primaryForeground }}
                  >
                    Primary Button
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Auto-computed Foreground: <span className="font-mono">{primaryForeground}</span></p>
                    <p className="text-muted-foreground text-xs mt-1">Contrast Ratio: {primaryContrast.toFixed(2)}:1 (Passes WCAG AA)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-red-50/50 border-red-200 dark:bg-red-900/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    Fails WCAG AA Contrast
                  </p>
                  <p className="text-xs mt-1 text-red-600 dark:text-red-500">
                    Best possible ratio: {primaryContrast.toFixed(2)}:1. This background doesn't have a text color that meets accessibility standards — try a darker or lighter shade.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              This color will be used for primary buttons, active links, and brand highlights. 
              The system automatically calculates and applies the most accessible text color (black or white) for this background.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                id="secondaryColor"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-32 font-mono"
              />
            </div>
            
            {isSecondaryPassing ? (
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center justify-center px-6 py-2 rounded-md font-medium text-sm shadow-sm"
                    style={{ backgroundColor: settings.secondaryColor, color: secondaryForeground }}
                  >
                    Secondary Badge
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Auto-computed Foreground: <span className="font-mono">{secondaryForeground}</span></p>
                    <p className="text-muted-foreground text-xs mt-1">Contrast Ratio: {secondaryContrast.toFixed(2)}:1 (Passes WCAG AA)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-red-50/50 border-red-200 dark:bg-red-900/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    Fails WCAG AA Contrast
                  </p>
                  <p className="text-xs mt-1 text-red-600 dark:text-red-500">
                    Best possible ratio: {secondaryContrast.toFixed(2)}:1. This background doesn't have a text color that meets accessibility standards — try a darker or lighter shade.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Used for subtle backgrounds, secondary buttons, and less prominent accents.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving || !isPassing}>
            {saving ? "Saving..." : "Save Brand Settings"}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Typography Colors</CardTitle>
          <CardDescription>Configure the colors used for headings, standard text, and subtle text. Leave empty to use system defaults.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="headingColor">Heading / Title Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                id="headingColor"
                value={settings.headingColor || "#0f172a"}
                onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={settings.headingColor || ""}
                onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                className="w-32 font-mono"
                placeholder="Default"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for main titles and page headers (H1-H6).</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label htmlFor="textColor">Body Text Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                id="textColor"
                value={settings.textColor || "#0f172a"}
                onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={settings.textColor || ""}
                onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                className="w-32 font-mono"
                placeholder="Default"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for standard paragraphs and generic body text.</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label htmlFor="mutedTextColor">Subheading / Muted Text Color</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                id="mutedTextColor"
                value={settings.mutedTextColor || "#64748b"}
                onChange={(e) => setSettings({ ...settings, mutedTextColor: e.target.value })}
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={settings.mutedTextColor || ""}
                onChange={(e) => setSettings({ ...settings, mutedTextColor: e.target.value })}
                className="w-32 font-mono"
                placeholder="Default"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for subheadings, captions, and secondary descriptions.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Typography Colors"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Integration</CardTitle>
          <CardDescription>Configure the WhatsApp contact button displayed across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input 
              id="whatsappNumber"
              value={settings.whatsappNumber || ""}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="+1234567890"
            />
            <p className="text-sm text-muted-foreground">Include the country code. Do not include spaces, dashes, or brackets.</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="whatsappMessage">Default Message</Label>
            <Input 
              id="whatsappMessage"
              value={settings.whatsappMessage || ""}
              onChange={(e) => setSettings({ ...settings, whatsappMessage: e.target.value })}
              placeholder="Hi, I'm interested in working with you!"
            />
            <p className="text-sm text-muted-foreground">This message will be pre-filled when a user clicks the WhatsApp button.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save WhatsApp Settings"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* We can add SEO and Analytics sections here later if needed */}
    </div>
  );
}
