"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, X } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { uploadImageService } from "@/service/setting/image.service";
import {
  convertFileToBase64,
  getFileExtension,
} from "@/utils/setting/image/image-upload";
import { UploadImage } from "@/model/setting/image-model";
import { baseAPI } from "@/constants/api";
import { useIsMobile } from "@/hooks/use-mobile";

// Define Zod schema for department form validation
const departmentFormSchema = z.object({
  code: z.string().min(1, { message: "Department code is required" }).trim(),
  name: z.string().min(1, { message: "Department name is required" }).trim(),
  urlLogo: z.string().optional(),
  imageId: z.string().optional(),
  status: z.literal(Constants.ACTIVE),
});

// Type for the form data based on the Zod schema
export type DepartmentFormData = z.infer<typeof departmentFormSchema> & {
  id?: number;
  selectedDepartment?: DepartmentModel; // For edit mode
};

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => void;
  initialData?: DepartmentFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting = false,
}: DepartmentModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state to store the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Flag to indicate if the logo was changed
  const [logoChanged, setLogoChanged] = useState(false);

  const isMobile = useIsMobile();
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: "",
      name: "",
      urlLogo: "",
      imageId: "",
      status: Constants.ACTIVE,
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        form.reset({
          code: initialData.code || "",
          name: initialData.name || "",
          urlLogo: initialData.urlLogo || "",
          imageId: initialData.imageId || "",
          status: Constants.ACTIVE,
        });

        // Set logo preview if urlLogo exists
        if (initialData.urlLogo) {
          setLogoPreview(initialData.urlLogo);
        } else {
          setLogoPreview(null);
        }
      } else {
        form.reset({
          code: "",
          name: "",
          urlLogo: "",
          imageId: "",
          status: Constants.ACTIVE,
        });
        setLogoPreview(null);
      }

      // Reset file-related states
      setSelectedFile(null);
      setLogoChanged(false);
      setFileInputKey((prev) => prev + 1);
    }
  }, [isOpen, initialData, mode, form]);

  // Clean up object URL when component unmounts or new file is selected
  useEffect(() => {
    return () => {
      // Clean up any created object URLs when component unmounts
      if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [selectedFile, logoPreview]);

  // Handle file selection without immediate upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      setFileInputKey((prev) => prev + 1);
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      setFileInputKey((prev) => prev + 1);
      return;
    }

    // Clean up previous preview URL if it's a blob URL
    if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    // Store the file in state
    setSelectedFile(file);

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Mark as changed
    setLogoChanged(true);
  };

  // Upload the image and return the response
  const uploadImage = async (file: File): Promise<any> => {
    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      const fileType = getFileExtension(file);

      // Create upload data object
      const uploadData: UploadImage = {
        type: fileType,
        base64: base64Data,
      };

      // Upload image using the service
      const response = await uploadImageService(uploadData);

      return response;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      setIsUploading(true);

      // If a new file was selected, upload it first
      if (selectedFile && logoChanged) {
        console.log("Uploading new image...");
        try {
          const response = await uploadImage(selectedFile);

          // Update form data with new image info
          data.imageId = response.id;
          data.urlLogo = response.imageUrl;

          // Clean up the object URL
          if (logoPreview && logoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
            console.log("Cleaned up object URL");
          }

          // Update preview to use the actual URL
          setLogoPreview(response.imageUrl);
        } catch (error: any) {
          console.error("Image upload failed:", error);
          toast.error(error.message || "Failed to upload image");
          setIsUploading(false);
          return; // Stop form submission if image upload fails
        }
      } else if (logoChanged && !selectedFile) {
        // If logo was removed
        data.imageId = "";
        data.urlLogo = "";
      } else {
        console.log("No logo changes");
      }

      // Prepare the submit data
      const submitData: DepartmentFormData = {
        ...data,
        status: Constants.ACTIVE,
      };

      // If in edit mode, include the ID
      if (mode === "edit" && initialData?.id) {
        submitData.id = initialData.id;
      }

      console.log("Final submit data:", submitData);

      // Reset flags
      setLogoChanged(false);

      // Submit the form
      console.log("Calling onSubmit with data");
      onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting department form:", error);
      toast.error("An error occurred while saving department");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle removing the logo
  const handleRemoveLogo = () => {
    // Clean up object URL if it exists
    if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview(null);
    setSelectedFile(null);
    form.setValue("urlLogo", "", { shouldDirty: true });
    form.setValue("imageId", "", { shouldDirty: true });
    setLogoChanged(true);
    setFileInputKey((prev) => prev + 1);
  };

  // Get placeholder or no-image URL for when no image is selected
  const getPlaceholderImage = () => {
    return baseAPI.NO_IMAGE; // Replace with your placeholder image path
  };

  // Determine the image source to display
  const getImageSource = () => {
    if (!logoPreview) {
      return getPlaceholderImage();
    }

    // If it's a blob URL (local preview), use it directly
    if (logoPreview.startsWith("blob:")) {
      return logoPreview;
    }

    // Otherwise, it's an API URL, so add the base URL
    return baseAPI.BASE_IMAGE + logoPreview;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-h-[90vh] rounded-xl overflow-y-auto ${
          isMobile ? "max-w-sm" : "max-w-lg"
        }`}
      >
        {" "}
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Department" : "Edit Department"}
          </DialogTitle>
          <DialogDescription>
            Fill in the information below to{" "}
            {mode === "add" ? "create" : "update"} a department.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Department Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Department Code <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department code"
                      {...field}
                      autoFocus
                      maxLength={50}
                      disabled={isSubmitting || isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Department Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department name"
                      {...field}
                      maxLength={100}
                      disabled={isSubmitting || isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo Upload */}
            <div className="space-y-2">
              <FormLabel>Department Logo</FormLabel>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="relative w-24 h-24">
                    <img
                      src={getImageSource()}
                      alt={logoPreview ? "Department logo" : "No logo"}
                      className="w-full h-full object-cover rounded-full bg-gray-100"
                    />
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                        disabled={isSubmitting || isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <label
                      htmlFor={`logo-upload-${fileInputKey}`}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center ${
                        isSubmitting || isUploading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoChanged && !logoPreview ? "Add" : "Change"} Logo
                      <input
                        id={`logo-upload-${fileInputKey}`}
                        key={fileInputKey}
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={isSubmitting || isUploading}
                      />
                    </label>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    PNG, JPG or GIF up to 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 justify-end mr-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading || isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isUploading ||
                  isSubmitting ||
                  (!form.formState.isDirty && !logoChanged) ||
                  !form.formState.isValid
                }
                className="bg-green-900 text-white hover:bg-green-950"
              >
                {isUploading || isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  `${mode === "add" ? "Create" : "Update"} Department`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
