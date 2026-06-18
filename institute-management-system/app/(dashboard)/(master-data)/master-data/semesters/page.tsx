"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, CheckCircle, Loader, Pencil, Trash2 } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { format, parseISO } from "date-fns";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { SemesterFormModal } from "@/components/dashboard/master-data/manage-semester/semester-form-modal";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SemesterType } from "@/constants/constant";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSemesterData,
  selectSemesterIsLoading,
  selectSemesterOperations,
  selectSemesterFilters,
} from "@/features/master-data/store/selectors/semester-selectors";
import {
  setSearchFilter,
  setPageNo,
  setAcademyYearFilter,
  resetState,
} from "@/features/master-data/store/slice/semester-slice";
import {
  fetchAllSemesterService,
  createSemesterService,
  updateSemesterService,
  deleteSemesterService,
} from "@/features/master-data/store/thunks/semester-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  } catch {
    return dateString;
  }
};

export default function ManageSemester() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectSemesterData);
  const isLoading = useAppSelector(selectSemesterIsLoading);
  const operations = useAppSelector(selectSemesterOperations);
  const filters = useAppSelector(selectSemesterFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [initialData, setInitialData] = useState<SemesterModel | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSemester, setDeletingSemester] = useState<SemesterModel | null>(null);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_SEMESTER,
    defaultPageSize: 10,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllSemesterService({
        search: searchDebounce,
        academyYear: filters.academyYear || undefined,
        status: Constants.ACTIVE,
        pageNo: currentPage,
        pageSize: 30,
      })
    );
  }, [dispatch, searchDebounce, currentPage, filters.academyYear]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  async function handleSubmit(formData: SemesterModel) {
    const payload = {
      semester: formData.semester,
      startDate: formData.startDate,
      endDate: formData.endDate,
      academyYear: formData.academyYear,
      status: formData.status,
    };

    if (modalMode === "add") {
      const result = await dispatch(createSemesterService(payload));
      if (createSemesterService.fulfilled.match(result)) {
        toast.success("Semester added successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add semester");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(updateSemesterService({ id: formData.id, data: payload }));
      if (updateSemesterService.fulfilled.match(result)) {
        toast.success("Semester updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to update semester");
      }
    }
  }

  async function handleDeleteSemester() {
    if (!deletingSemester?.id) return;
    const result = await dispatch(deleteSemesterService(deletingSemester.id));
    if (deleteSemesterService.fulfilled.match(result)) {
      toast.success("Semester deleted successfully");
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete semester");
    }
    setIsDeleteDialogOpen(false);
    setDeletingSemester(null);
  }

  const columns: TableColumn<SemesterModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * 30 + index + 1,
    },
    {
      key: "semester",
      label: "Semester",
      render: (s) =>
        s.semester === "SEMESTER_1"
          ? "Semester 1"
          : s.semester === "SEMESTER_2"
          ? "Semester 2"
          : s.semester,
    },
    { key: "startDate", label: "Start Date", render: (s) => formatDate(s.startDate) },
    { key: "endDate", label: "End Date", render: (s) => formatDate(s.endDate) },
    { key: "academyYear", label: "Academy Year", render: (s) => s.academyYear },
    {
      key: "semesterType",
      label: "Status",
      render: (s) => (
        <>
          {s.semesterType === SemesterType.DONE && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} /><span>Done</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROCESSING && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader size={16} /><span>Processing</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROGRESS && (
            <div className="flex items-center gap-2 text-yellow-500">
              <CalendarClock size={16} /><span>Progress</span>
            </div>
          )}
        </>
      ),
    },
    { key: "createdAt", label: "Created At", render: (s) => DateTimeFormatter(s.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => { setModalMode("edit"); setInitialData(s); setIsModalOpen(true); }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
            disabled={operations.isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => { setDeletingSemester(s); setIsDeleteDialogOpen(true); }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
            disabled={operations.isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Semester" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Semesters",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search semester...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => { setModalMode("add"); setInitialData(undefined); setIsModalOpen(true); },
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academy Year",
              value: filters.academyYear ?? 0,
              onChange: (v) => dispatch(setAcademyYearFilter((v as number) || undefined)),
            },
          ],
          onClearAll: () => {
            dispatch(setSearchFilter(""));
            dispatch(setAcademyYearFilter(undefined));
          },
        }}
        essentialFilterIds={[]}
      />

      <DataTable
        data={data?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        emptyMessage="No semesters found"
        getRowKey={(s) => s.id ?? 0}
      />

      <SemesterFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingSemester(null); }}
        onDelete={handleDeleteSemester}
        title="Delete Semester"
        description="Are you sure you want to delete the semester:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
