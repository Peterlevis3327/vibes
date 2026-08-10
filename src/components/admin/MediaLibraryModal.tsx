"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, UploadCloud, Crop as CropIcon, RefreshCw } from "lucide-react";
import { getCloudinaryImages, getCloudinarySignature, invalidateCloudinaryCache } from "@/app/actions/cloudinary";
import { toast } from "sonner";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CloudinaryImage {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
}

interface MediaLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string, altText: string, caption?: string) => void;
}

export function MediaLibraryModal({ open, onOpenChange, onSelect }: MediaLibraryModalProps) {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  
  // Cropping state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const data = await getCloudinaryImages();
      setImages(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load images. Are Cloudinary keys set?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedImage && altText) {
      let finalUrl = selectedImage;
      if (isCropping && completedCrop && imgRef.current) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        const x = Math.round(completedCrop.x * scaleX);
        const y = Math.round(completedCrop.y * scaleY);
        const w = Math.round(completedCrop.width * scaleX);
        const h = Math.round(completedCrop.height * scaleY);
        
        if (finalUrl.includes('/upload/')) {
          finalUrl = finalUrl.replace('/upload/', `/upload/c_crop,x_${x},y_${y},w_${w},h_${h}/`);
        }
      }

      onSelect(finalUrl, altText, caption);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    setAltText("");
    setCaption("");
    setIsCropping(false);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sigData = await getCloudinarySignature();
      if (!sigData.cloudName) {
        throw new Error("Missing Cloudinary config");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey || "");
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", "portfolio");

      const response = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setSelectedImage(data.secure_url);
        toast.success("Image uploaded successfully");
        await invalidateCloudinaryCache();
        loadImages(); // Refresh library
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col mt-4 min-h-0">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="library">
              <ImageIcon className="h-4 w-4 mr-2" /> Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadCloud className="h-4 w-4 mr-2" /> Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No images found. Upload one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img) => (
                  <div 
                    key={img.publicId} 
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                    onClick={() => {
                      setSelectedImage(img.url);
                      setAltText(img.alt || "");
                      setCaption("");
                      setIsCropping(false);
                      setCrop(undefined);
                      setCompletedCrop(null);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || 'Library image'} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg mt-4 bg-muted/20">
            <div className="text-center space-y-4 p-8">
              <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Click to upload</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
              </div>
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    {uploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Browse Files
                  </div>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Image Editor (Crop & Alt Text) */}
        {selectedImage && (
          <div className="mt-6 border-t pt-6 grid grid-cols-[300px_1fr] gap-6">
            <div className="space-y-3">
              <div className="relative bg-muted rounded-md border flex items-center justify-center overflow-hidden h-[200px]">
                {isCropping ? (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img ref={imgRef} src={selectedImage} alt="Crop preview" className="max-h-[200px] max-w-[300px] object-contain" />
                  </ReactCrop>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedImage} alt="Selected preview" className="max-h-[200px] max-w-[300px] object-contain" />
                )}
              </div>
              <Button 
                variant={isCropping ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                onClick={() => setIsCropping(!isCropping)}
              >
                <CropIcon className="h-4 w-4 mr-2" />
                {isCropping ? "Done Cropping" : "Crop Image"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="altText" className="text-base">
                  Alternative Text (Required) <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for screen readers (e.g. 'A sleek modern dashboard interface')"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Crucial for accessibility (a11y) and SEO. Describe exactly what appears in the image.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-base">
                  Caption (Optional)
                </Label>
                <Input 
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional visible caption text for this image..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetState}>Clear Selection</Button>
                <Button disabled={!altText} onClick={handleConfirm}>
                  Attach to Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
