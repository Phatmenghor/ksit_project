"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, Building2, Loader2 } from "lucide-react";
import { Constants } from "@/constants/text-string";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { uploadImageService } from "@/service/setting/image.service";
import { convertFileToBase64, getFileExtension } from "@/utils/setting/image/image-upload";
import { UploadImage } from "@/model/setting/image-model";
import { baseAPI } from "@/constants/api";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

const departmentFormSchema = z.object({
  code: z.string().min(1, { message: "Department code is required" }),
  name: z.string().min(1, { message: "Department name is required" }),
  urlLogo: z.string().optional(),
  imageId: z.string().optional(),
  status: z.literal(Constants.ACTIVE),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema> & {
  id?: number;
  selectedDepartment?: DepartmentModel;
};

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => void;
  initialData?: DepartmentFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export function DepartmentFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: DepartmentModalProps) {
  const isCreate = mode === "add";
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { code: "", name: "", urlLogo: "", imageId: "", status: Constants.ACTIVE },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ code: initialData.code || "", name: initialData.name || "", urlLogo: initialData.urlLogo || "", imageId: initialData.imageId || "", status: Constants.ACTIVE });
      setLogoPreview(initialData.urlLogo || null);
    } else {
      form.reset({ code: "", name: "", urlLogo: "", imageId: "", status: Constants.ACTIVE });
      setLogoPreview(null);
    }
    setSelectedFile(null);
    setLogoChanged(false);
    setFileInputKey((prev) => prev + 1);
  }, [isOpen, initialData, mode]);

  useEffect(() => {
    return () => {
      if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [selectedFile, logoPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File size must be less than 2MB"); setFileInputKey((prev) => prev + 1); return; }
    if (!file.type.startsWith("image/")) { toast.error("File must be an image"); setFileInputKey((prev) => prev + 1); return; }
    if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoChanged(true);
  };

  const uploadImage = async (file: File): Promise<any> => {
    const base64Data = await convertFileToBase64(file);
    const fileType = getFileExtension(file);
    const uploadData: UploadImage = { type: fileType, base64: base64Data };
    return await uploadImageService(uploadData);
  };

  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      setIsUploading(true);
      if (selectedFile && logoChanged) {
        try {
          const response = await uploadImage(selectedFile);
          data.imageId = response.id;
          data.urlLogo = response.imageUrl;
          if (logoPreview && logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
          setLogoPreview(response.imageUrl);
        } catch (error: any) {
          toast.error(error.message || "Failed to upload image");
          setIsUploading(false);
          return;
        }
      } else if (logoChanged && !selectedFile) {
        data.imageId = "";
        data.urlLogo = "";
      }
      const submitData: DepartmentFormData = { ...data, status: Constants.ACTIVE };
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      setLogoChanged(false);
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving department");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (selectedFile && logoPreview && logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setSelectedFile(null);
    form.setValue("urlLogo", "", { shouldDirty: true });
    form.setValue("imageId", "", { shouldDirty: true });
    setLogoChanged(true);
    setFileInputKey((prev) => prev + 1);
  };

  const getImageSource = () => {
    if (!logoPreview) return baseAPI.NO_IMAGE;
    if (logoPreview.startsWith("blob:")) return logoPreview;
    return baseAPI.BASE_IMAGE + logoPreview;
  };

  const busy = isSubmitting || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Department" : "Edit Department"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} a department.`}
          icon={<Building2 className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter department code" {...field} autoFocus maxLength={50} disabled={busy} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter department name" {...field} maxLength={100} disabled={busy} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-2">
                <FormLabel>Department Logo</FormLabel>
                <div className="border border-dashed border-border rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative w-20 h-20">
                      <img src={getImageSource()} alt="Department logo" className="w-full h-full object-cover rounded-full bg-muted" />
                      {logoPreview && (
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveLogo} disabled={busy}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <label htmlFor={`logo-upload-${fileInputKey}`} className={`cursor-pointer px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 flex items-center gap-1.5 ${busy ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <Upload className="h-4 w-4" />
                      {logoChanged && !logoPreview ? "Add" : "Change"} Logo
                      <input id={`logo-upload-${fileInputKey}`} key={fileInputKey} ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={busy} />
                    </label>
                    <p className="text-xs text-muted-foreground">PNG, JPG or GIF up to 2MB</p>
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter>
              <CancelButton onClick={onClose} disabled={busy} />
              <Button
                type="submit"
                disabled={busy || (!form.formState.isDirty && !logoChanged) || !form.formState.isValid}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? (isCreate ? "Creating..." : "Updating...") : (isCreate ? "Create Department" : "Update Department")}
              </Button>
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
