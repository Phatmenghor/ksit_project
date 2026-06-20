"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClassColumns } from "./columns";
import { useEffect, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  ClassFormData,
  ClassFormModal,
} from "@/components/dashboard/master-data/manage-class/class-form-modal";
import { DegreeEnum } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { DataTable } from "@/components/shared/data-table";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectClassData,
  selectClassIsLoading,
  selectClassOperations,
  selectClassFilters,
} from "@/features/master-data/store/selectors/class-selectors";
import {
  setSearchFilter,
  setPageNo,
  setMajorFilter,
  setAcademyYearFilter,
} from "@/features/master-data/store/slice/class-slice";
import {
  fetchAllClassService,
  createClassService,
  updateClassService,
  deleteClassService,
} from "@/features/master-data/store/thunks/class-thunks";

export default function ManageClassPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectClassData);
  const isLoading = useAppSelector(selectClassIsLoading);
  const operations = useAppSelector(selectClassOperations);
  const filters = useAppSelector(selectClassFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassModel | null>(null);
  const [initialData, setInitialData] = useState<ClassFormData | undefined>(undefined);
  const [selectedMajor, setSelectedMajor] = useState<MajorModel | null>(null);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_CLASS,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("md-classes", () => {
    dispatch(
      fetchAllClassService({
        search: searchDebounce,
        status: Constants.ACTIVE,
        majorId: filters.majorId,
        academyYear: filters.academyYear || undefined,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, currentPage, currentPageSize, filters.majorId, filters.academyYear]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classData: ClassModel) => {
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

  async function handleSubmit(formData: ClassFormData) {
    const payload = {
      code: formData.code,
      academyYear: formData.academyYear,
      degree: formData.degree,
      majorId: formData.majorId,
      status: formData.status,
      yearLevel: formData.yearLevel,
    };

    if (modalMode === "add") {
      const result = await dispatch(createClassService(payload));
      if (createClassService.fulfilled.match(result)) {
        toast.success(`Class ${result.payload.code} added successfully`);
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add class");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(updateClassService({ id: formData.id, data: payload }));
      if (updateClassService.fulfilled.match(result)) {
        toast.success(`Class ${result.payload.code} updated successfully`);
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to update class");
      }
    }
  }

  async function handleDeleteClass() {
    if (!deletingClass) return;
    const result = await dispatch(deleteClassService(deletingClass.id));
    if (deleteClassService.fulfilled.match(result)) {
      toast.success(`Class ${deletingClass.code} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete class");
    }
    setIsDeleteDialogOpen(false);
    setDeletingClass(null);
  }

  const columns = createClassColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    onEdit: handleOpenEditModal,
    onDelete: (cls) => { setDeletingClass(cls); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Class" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Classes",
          totalCount: data?.totalElements,
          searchValue: filters.search,
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
              onChange: (v) => {
                const major = v as MajorModel | null;
                setSelectedMajor(major);
                dispatch(setMajorFilter(major?.id ?? undefined));
              },
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Major</label>
                  <ComboboxSelectMajor
                    dataSelect={value}
                    onChangeSelected={onChange}
                    disabled={operations.isDeleting}
                  />
                </div>
              ),
            },
            {
              id: "year",
              type: "custom",
              label: "Academy Year",
              value: filters.academyYear ?? 0,
              onChange: (v) => dispatch(setAcademyYearFilter((v as number) || undefined)),
              render: ({ value, onChange }) => (
                <AcademyYearFilter
                  value={(value as number) ?? 0}
                  onChange={(y) => onChange(y)}
                  disabled={operations.isDeleting}
                  label="Academy Year"
                />
              ),
            },
          ],
          onClearAll: () => {
            dispatch(setSearchFilter(""));
            dispatch(setMajorFilter(undefined));
            dispatch(setAcademyYearFilter(undefined));
            setSelectedMajor(null);
          },
        }}
        essentialFilterIds={["major", "year"]}
      />

      <DataTable
        data={data?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No classes found"
        getRowKey={(cls) => cls.id}
      />

      <ClassFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingClass(null); }}
        onDelete={handleDeleteClass}
        title="Delete Class"
        description="Are you sure you want to delete the class:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
