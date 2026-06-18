"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
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
import { DegreeEnum, Degrees } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { AcademyYearPicker } from "@/components/shared/academy-year-picker";
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
  resetState,
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

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_CLASS,
    defaultPageSize: 10,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllClassService({
        search: searchDebounce,
        status: Constants.ACTIVE,
        majorId: filters.majorId,
        academyYear: filters.academyYear || undefined,
        pageNo: currentPage,
        pageSize: 30,
      })
    );
  }, [dispatch, searchDebounce, currentPage, filters.majorId, filters.academyYear]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

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

  const columns: TableColumn<ClassModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * 30 + index + 1,
    },
    { key: "code", label: "Class Code", width: "140px", render: (cls) => cls.code },
    { key: "major", label: "Major", render: (cls) => cls.major.name },
    {
      key: "degree",
      label: "Degree",
      render: (cls) => Degrees.find((d) => d.value === cls.degree)?.label ?? cls.degree,
    },
    {
      key: "yearLevel",
      label: "Year Level",
      render: (cls) => {
        const map: Record<string, string> = {
          FIRST_YEAR: "Year 1",
          SECOND_YEAR: "Year 2",
          THIRD_YEAR: "Year 3",
          FOURTH_YEAR: "Year 4",
        };
        return map[cls.yearLevel] ?? cls.yearLevel;
      },
    },
    { key: "academyYear", label: "Academy Year", render: (cls) => cls.academyYear },
    { key: "createdAt", label: "Created At", render: (cls) => DateTimeFormatter(cls.createdAt) },
    {
      key: "actions",
      label: "",
      width: "90px",
      render: (cls) => (
        <div className="flex gap-1">
          <Button
            onClick={() => handleOpenEditModal(cls)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-gray-200 hover:bg-gray-300"
            title="Edit"
            disabled={operations.isDeleting}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => { setDeletingClass(cls); setIsDeleteDialogOpen(true); }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-red-500 text-white hover:bg-red-600"
            disabled={operations.isDeleting}
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Academy Year</label>
                  <AcademyYearPicker
                    value={(value as number) ?? 0}
                    onChange={(y) => onChange(y)}
                    disabled={operations.isDeleting}
                  />
                </div>
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
