"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, X, Camera } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { uploadImageService } from "@/service/setting/image.service";
import { UploadImage } from "@/model/setting/image-model";

export default function ProfileUploadCard() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setValue, watch } = useFormContext();
  const profileUrl = watch("profileUrl");

  useEffect(() => {
    if (profileUrl) {
      setLogoPreview(profileUrl);
      setImageError(false);
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

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setImageError(false);

    try {
      // Create preview immediately for better UX
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        const payload: UploadImage = {
          base64: base64Data,
          type: file.type,
        };

        try {
          const response = await uploadImageService(payload);
          if (response?.imageUrl) {
            // Clean up preview URL and set actual URL
            URL.revokeObjectURL(previewUrl);
            setValue("profileUrl", response.imageUrl, { shouldValidate: true });
            setLogoPreview(response.imageUrl);
          }
        } catch (uploadError) {
          // Revert to no image on upload failure
          URL.revokeObjectURL(previewUrl);
          setLogoPreview(null);
          setImageError(true);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setImageError(true);
    } finally {
      setIsUploading(false);
      // Clear the input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setImageError(false);
    setValue("profileUrl", "", { shouldDirty: true });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSource = () => {
    if (!logoPreview) return "";
    return logoPreview?.startsWith("http")
      ? logoPreview
      : (process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "") + logoPreview;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 space-y-4 flex flex-col items-center">
        <div className="relative group">
          {/* Main profile circle */}
          <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {logoPreview && !imageError ? (
              <img
                src={getImageSource()}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                draggable={false}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Overlay for upload when hovering and no image */}
            {!logoPreview && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full"
                onClick={handleUploadClick}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {logoPreview ? (
            <div className="absolute -bottom-1 -right-1 flex space-x-1">
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="bg-red-500 rounded-full p-2 border-3 border-white hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={isUploading}
                title="Remove profile image"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Change image button */}
              <button
                type="button"
                onClick={handleUploadClick}
                className="bg-blue-500 rounded-full p-2 border-3 border-white hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={isUploading}
                title="Change profile image"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            /* Upload button when no image */
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-2 border-3 border-white hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              disabled={isUploading}
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
            </button>
          )}

          {/* Hidden file input */}
          <Input
            id="profile-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {/* Text and status */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-gray-700">
            {logoPreview ? "Profile Image" : "Add Profile"}
          </p>
          {imageError && (
            <p className="text-xs text-red-500">Failed to load image</p>
          )}
          {isUploading && <p className="text-xs text-blue-500">Uploading...</p>}
          {!logoPreview && !isUploading && (
            <p className="text-xs text-gray-500">Click to upload</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
