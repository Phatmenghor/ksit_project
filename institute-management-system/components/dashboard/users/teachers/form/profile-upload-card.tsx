"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Trash2, Upload, UserCircle2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { uploadImageService } from "@/service/setting/image.service";
import { UploadImage } from "@/model/setting/image-model";
import { cn } from "@/lib/utils";

export default function ProfileUploadCard() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setValue, watch } = useFormContext();
  const profileUrl = watch("profileUrl");

  useEffect(() => {
    if (profileUrl) {
      setPreview(profileUrl);
      setImageError(false);
    }
  }, [profileUrl]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const getImageSrc = () => {
    if (!preview) return "";
    return preview.startsWith("http") || preview.startsWith("blob:")
      ? preview
      : (process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "") + preview;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setImageError(false);
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const payload: UploadImage = { base64: base64Data, type: file.type };
        try {
          const response = await uploadImageService(payload);
          if (response?.imageUrl) {
            URL.revokeObjectURL(blobUrl);
            setValue("profileUrl", response.imageUrl, { shouldValidate: true });
            setPreview(response.imageUrl);
          }
        } catch {
          URL.revokeObjectURL(blobUrl);
          setPreview(null);
          setImageError(true);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setImageError(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setImageError(false);
    setValue("profileUrl", "", { shouldDirty: true });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center cursor-pointer group transition-all duration-200",
                !preview && "hover:from-primary/5 hover:to-primary/10"
              )}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              {preview && !imageError ? (
                <img
                  src={getImageSrc()}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  draggable={false}
                  onError={() => setImageError(true)}
                />
              ) : (
                <UserCircle2 className="w-14 h-14 text-slate-300" />
              )}

              {/* Upload hover overlay (no image) */}
              {!preview && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              )}

              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            {preview && !isUploading && (
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary rounded-full p-1.5 border-2 border-white shadow hover:bg-primary/90 transition-colors"
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-destructive rounded-full p-1.5 border-2 border-white shadow hover:bg-destructive/90 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}

            {/* Upload button (no image) */}
            {!preview && !isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-2 border-white shadow hover:bg-primary/90 transition-colors"
                title="Upload photo"
              >
                <Upload className="w-3.5 h-3.5 text-white" />
              </button>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Info text */}
          <div className="text-center sm:text-left space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {preview ? "Profile Photo" : "Upload Profile Photo"}
            </p>
            {imageError && <p className="text-xs text-destructive">Failed to load image</p>}
            {isUploading && <p className="text-xs text-primary">Uploading...</p>}
            {!preview && !isUploading && (
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP · Max 5 MB
              </p>
            )}
            {preview && !isUploading && (
              <p className="text-xs text-muted-foreground">
                Click camera to change · trash to remove
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
