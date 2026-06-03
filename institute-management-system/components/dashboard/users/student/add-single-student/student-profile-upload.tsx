"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { baseAPI } from "@/constants/api";
import { Input } from "@/components/ui/input";
import { UploadImage } from "@/model/setting/image-model";
import { uploadImageService } from "@/service/setting/image.service";

export default function StudentProfileUploadCard() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setValue, watch } = useFormContext();
  const profileUrl = watch("profileUrl");

  useEffect(() => {
    if (profileUrl) {
      setLogoPreview(profileUrl);
    }
  }, [profileUrl]);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        const payload: UploadImage = {
          base64: base64Data,
          type: file.type,
        };

        const response = await uploadImageService(payload);
        if (response?.imageUrl) {
          setValue("profileUrl", response.imageUrl, { shouldValidate: true });
          setLogoPreview(response.imageUrl);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue("profileUrl", "", { shouldDirty: true });
  };

  const getImageSource = () => {
    if (!logoPreview) {
      return baseAPI.NO_IMAGE;
    }
    return logoPreview.startsWith("http") || logoPreview.startsWith("blob:")
      ? logoPreview
      : process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE + logoPreview;
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-3 flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-100 overflow-hidden relative">
            {logoPreview ? (
              <img
                src={getImageSource()}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                draggable={false}
              />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
          </div>

          {/* Conditional button - X for remove or + for upload */}
          {logoPreview ? (
            // Remove (X) button when image exists
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white hover:bg-red-600 transition-colors duration-200 shadow-md z-10"
              disabled={isUploading}
              title="Remove profile image"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          ) : (
            // Upload (+) button when no image
            <label
              htmlFor="profile-upload"
              className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors duration-200 shadow-md z-10"
              onClick={(e) => e.stopPropagation()}
              title="Upload profile image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </label>
          )}

          {/* Hidden file input field */}
          <Input
            id="profile-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <p className="text-sm font-medium">
          {logoPreview ? "Profile Image" : "Add Profile"}
        </p>
      </CardContent>
    </Card>
  );
}
