"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { createPaymentDetailColumns } from "./columns";
import { useCallback, useEffect, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { PaymentModel } from "@/model/payment/payment-model";
import { PaymentRequest } from "@/model/payment/payment-request-model";
import {
  PaymentFormData,
  PaymentFormModal,
} from "@/components/dashboard/payment/payment-form-model";
import { useParams, useSearchParams } from "next/navigation";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPaymentData,
  selectPaymentIsLoading,
  selectPaymentOperations,
} from "@/features/payments/store/selectors/payment-selectors";
import {
  fetchAllPaymentsService,
  createPaymentServiceThunk,
  updatePaymentServiceThunk,
  deletePaymentService,
} from "@/features/payments/store/thunks/payment-thunks";
import { fetchStudentByIdThunk } from "@/features/students/store/thunks/student-thunks";
import { selectSelectedStudent } from "@/features/students/store/selectors/student-selectors";

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const allPaymentData = useAppSelector(selectPaymentData);
  const isLoading = useAppSelector(selectPaymentIsLoading);
  const operations = useAppSelector(selectPaymentOperations);
  const studentDetail = useAppSelector(selectSelectedStudent);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentModel | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<PaymentFormData | undefined>(
    undefined
  );

  const params = useParams();
  const id = params?.id ? Number(params.id) : 0;
  const searchParams = useSearchParams();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.PAYMENT.VIEW_PAYMENT(String(id)),
    });

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const handleOpenEditModal = (data: PaymentModel) => {
    const formData: PaymentFormData = {
      id: data.id,
      amount: data.amount,
      comment: data.commend,
      item: data.item,
      percentage: data.percentage,
      type: data.type,
    };

    setModalMode("edit");
    setInitialData(formData);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
    setModalMode("add");
    setInitialData(undefined);
  };

  async function handleSubmit(formData: PaymentFormData) {
    const payload: PaymentRequest = {
      item: formData.item,
      type: formData.type,
      amount: formData.amount,
      percentage: formData.percentage,
      date: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      commend: formData.comment,
      userId: id,
    };

    try {
      if (modalMode === "add") {
        await dispatch(createPaymentServiceThunk(payload)).unwrap();
        toast.success("Payment added successfully");
        setIsModalOpen(false);
      } else if (modalMode === "edit" && formData.id) {
        await dispatch(updatePaymentServiceThunk({ id: formData.id, data: payload })).unwrap();
        toast.success("Payment updated successfully");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  }

  const loadInfo = async () => {
    try {
      await dispatch(fetchStudentByIdThunk(id.toString())).unwrap();
    } catch (error) {
      toast.error("Error getting student data");
    }
  };

  const payment = useCallback(
    async (param: any) => {
      try {
        const response = await dispatch(
          fetchAllPaymentsService({
            status: Constants.ACTIVE,
            userId: id,
            pageNo: currentPage,
            pageSize: currentPageSize,
            ...param,
          })
        ).unwrap();

        if (response) {
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading payments");
      }
    },
    [id, currentPage, currentPageSize, dispatch, updateUrlWithPage]
  );

  useEffect(() => {
    loadInfo();
  }, [id]);

  useEffect(() => {
    payment({});
  }, [currentPage]);

  async function handleDeletePayment() {
    if (!selectedPayment) return;

    try {
      await dispatch(deletePaymentService(selectedPayment.id)).unwrap();
      toast.success("Payment deleted successfully");
      if (
        allPaymentData &&
        allPaymentData.content.length === 1 &&
        currentPage > 1
      ) {
        updateUrlWithPage(currentPage - 1);
      } else {
        await payment({});
      }
    } catch (error) {
      toast.error("An error occurred while deleting the payment.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }

  const getStudentName = () => {
    if (studentDetail?.englishFirstName && studentDetail?.englishLastName) {
      return `${studentDetail.englishFirstName} ${studentDetail.englishLastName}`;
    } else if (studentDetail?.khmerFirstName && studentDetail?.khmerLastName) {
      return `${studentDetail.khmerFirstName} ${studentDetail.khmerLastName}`;
    } else {
      return `${studentDetail?.username || ""}`;
    }
  };

  const columns = createPaymentDetailColumns({
    getDisplayIndex,
    isSubmitting: operations.isCreating || operations.isUpdating || operations.isDeleting,
    onEdit: handleOpenEditModal,
    onDelete: (pay) => { setSelectedPayment(pay); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title={`View Student ${getStudentName()}`}
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          {
            label: "Student payment",
            href: ROUTE.PAYMENT.VIEW_PAYMENT(id.toString()),
          },
        ]}
      />

      <UserProfileSection user={studentDetail} />

      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <p>ការបង់ថ្លៃផ្សេងៗ</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddNew}
                className="bg-green-900 text-white hover:bg-green-950"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              data={allPaymentData?.content ?? null}
              columns={columns}
              loading={isLoading}
              currentPage={currentPage}
              totalPages={allPaymentData?.totalPages ?? 0}
              totalElements={allPaymentData?.totalElements}
              onPageChange={handlePageChange}
              pageSize={currentPageSize}
              onPageSizeChange={handlePageSizeChange}
              emptyMessage="No Records"
              getRowKey={(pay) => pay.id}
            />
          </div>
        </CardContent>
      </Card>

      <PaymentFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeletePayment}
        title="Delete payment"
        description="Are you sure you want to delete the payment : "
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
