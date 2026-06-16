"use client";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ROUTE } from "@/constants/routes";
import {
  createClassService,
  deleteClassService,
  getAllClassService,
  updateClassService,
} from "@/service/master-data/class.service";
import { AllClassFilterModel } from "@/model/master-data/class/type-class-model";
import { Constants } from "@/constants/text-string";
import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  ClassFormData,
  ClassFormModal,
} from "@/components/dashboard/master-data/manage-class/class-form-modal";
import { DegreeEnum, Degrees } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { AcademyYearPicker } from "@/components/shared/academy-year-picker";

export default function ManageClassPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [allClassData, setAllClassData] = useState<AllClassModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMajor, setSelectedMajor] = useState<MajorModel | null>(null);
  const [initialData, setInitialData] = useState<ClassFormData | undefined>(undefined);

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.MASTER_DATA.MANAGE_CLASS, defaultPageSize: 10 });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const loadClass = useCallback(
    async (param: AllClassFilterModel = {}) => {
      setIsLoading(true);
      try {
        const response = await getAllClassService({
          search: debouncedSearchQuery,
          status: Constants.ACTIVE,
          majorId: selectedMajor?.id,
          pageNo: currentPage,
          pageSize: 30,
          academyYear: selectedYear || undefined,
          ...param,
        });
        console.log("[Classes] API response:", response);
        if (response) {
          console.log("[Classes] content length:", response?.content?.length, "totalElements:", response?.totalElements);
          setAllClassData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
          }
        } else {
          toast.error("Failed to fetch class data");
        }
      } catch {
        toast.error("An error occurred while loading class data");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage, selectedYear, selectedMajor]
  );

  useEffect(() => {
    loadClass();
  }, [currentPage, debouncedSearchQuery, selectedYear, selectedMajor]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classData: ClassModel) => {
    setSelectedClass(classData);
    setInitialData({
      id: classData.id,
      academyYear: Number(classData.academyYear),
      code: classData.code,
      degree: classData.degree as DegreeEnum,
      status: Constants.ACTIVE,
      yearLevel: classData.yearLevel,
      majorId: classData.major.id,
      selectedMajor: classData.major,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleDeleteClass() {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      const originalData = allClassData;
      setAllClassData((prev) =>
        prev
          ? { ...prev, content: prev.content.filter((c) => c.id !== selectedClass.id), totalElements: prev.totalElements - 1 }
          : null
      );
      const response = await deleteClassService(selectedClass.id);
      if (response) {
        toast.success(`Class ${selectedClass.code} deleted successfully`);
        if (allClassData && allClassData.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadClass({});
        }
      } else {
        setAllClassData(originalData);
        toast.error("Failed to delete class");
      }
    } catch {
      toast.error("An error occurred while deleting the class");
      loadClass({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleSubmit(formData: ClassFormData) {
    setIsSubmitting(true);
    try {
      const classData = {
        code: formData.code.trim(),
        academyYear: formData.academyYear,
        degree: formData.degree,
        majorId: formData.majorId,
        status: formData.status,
        yearLevel: formData.yearLevel,
      };
      if (modalMode === "add") {
        try {
          const response = await createClassService(classData);
          if (response) {
            setAllClassData((prev) =>
              prev ? { ...prev, content: [response, ...prev.content], totalElements: prev.totalElements + 1 } : null
            );
            toast.success(`Class ${response.code} added successfully`);
            await loadClass({});
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add class");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          const response = await updateClassService(formData.id, classData);
          if (response) {
            setAllClassData((prev) =>
              prev
                ? { ...prev, content: prev.content.map((c) => (c.id === formData.id ? response : c)) }
                : null
            );
            toast.success(`Class ${response.code} updated successfully`);
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update class");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<ClassModel>[] = [
    { key: "no", label: "#", width: "50px", render: (_, i) => getDisplayIndex(i) },
    { key: "code", label: "Class Code", width: "140px", render: (cls) => cls.code },
    { key: "major", label: "Major", render: (cls) => cls.major.name },
    {
      key: "degree", label: "Degree",
      render: (cls) => Degrees.find((d) => d.value === cls.degree)?.label ?? cls.degree,
    },
    {
      key: "yearLevel", label: "Year Level",
      render: (cls) => {
        const map: Record<string, string> = {
          FIRST_YEAR: "Year 1", SECOND_YEAR: "Year 2",
          THIRD_YEAR: "Year 3", FOURTH_YEAR: "Year 4",
        };
        return map[cls.yearLevel] ?? cls.yearLevel;
      },
    },
    { key: "academyYear", label: "Academy Year", render: (cls) => cls.academyYear },
    {
      key: "createdAt", label: "Created At",
      render: (cls) => DateTimeFormatter(cls.createdAt),
    },
    {
      key: "actions", label: "", width: "90px",
      render: (cls) => (
        <div className="flex gap-1">
          <Button
            onClick={() => handleOpenEditModal(cls)}
            variant="ghost" size="icon"
            className="h-7 w-7 bg-gray-200 hover:bg-gray-300"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => { setSelectedClass(cls); setIsDeleteDialogOpen(true); }}
            variant="ghost" size="icon"
            className="h-7 w-7 bg-red-500 text-white hover:bg-red-600"
            disabled={isSubmitting}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Class</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Classes",
          searchValue: searchQuery,
          searchPlaceholder: "Search class...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
          filters: [
            {
              id: "major",
              type: "custom",
              label: "Major",
              value: selectedMajor,
              onChange: (v) => setSelectedMajor(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Major</label>
                  <ComboboxSelectMajor
                    dataSelect={value}
                    onChangeSelected={onChange}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "year",
              type: "custom",
              label: "Academy Year",
              value: selectedYear,
              onChange: (v) => setSelectedYear(v as number),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Academy Year</label>
                  <AcademyYearPicker
                    value={value as number ?? 0}
                    onChange={(y) => onChange(y)}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            setSelectedMajor(null);
            setSelectedYear(0);
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["major", "year"]}
      />

      <DataTable
        data={allClassData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allClassData?.totalPages ?? 0}
        totalElements={allClassData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No classes found"
        getRowKey={(cls) => cls.id}
      />

      <ClassFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteClass}
        title="Delete Class"
        description={`Are you sure you want to delete the class: ${selectedClass?.code}?`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
