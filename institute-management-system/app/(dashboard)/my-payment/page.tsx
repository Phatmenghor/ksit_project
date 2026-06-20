"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { createMyPaymentColumns } from "./columns";
import { useEffect, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { PaymentModel } from "@/model/payment/payment-model";
import {
  PaymentFormData,
  PaymentFormModal,
} from "@/components/dashboard/payment/payment-form-model";
import { useParams } from "next/navigation";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { PaymentRequest } from "@/model/payment/payment-request-model";
import { fetchStudentProfileThunk } from "@/store/slices/auth-slice";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPaymentData,
  selectPaymentIsLoading,
  selectPaymentOperations,
} from "@/features/payments/store/selectors/payment-selectors";
import {
  setPageNo,
} from "@/features/payments/store/slice/payment-slice";
import {
  fetchAllPaymentsService,
  createPaymentByTokenService,
  updatePaymentByTokenService,
  deletePaymentService,
} from "@/features/payments/store/thunks/payment-thunks";

type PaymentItem = PaymentModel;

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectPaymentData);
  const isLoading = useAppSelector(selectPaymentIsLoading);
  const operations = useAppSelector(selectPaymentOperations);
  const rawStudentDetail = useAppSelector((state) => state.auth.studentProfile);
  const studentDetail = rawStudentDetail ? {
    ...rawStudentDetail,
    classId: rawStudentDetail.studentClass?.id,
    studentParent: rawStudentDetail.studentParent,
    studentStudiesHistory: rawStudentDetail.studentStudiesHistory,
    studentSibling: rawStudentDetail.studentSibling,
    nationality: rawStudentDetail.nationality,
  } : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<PaymentFormData | undefined>(undefined);

  const params = useParams();
  const id = params?.id ? Number(params.id) : 0;

  const { currentPage, currentPageSize, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.PAYMENT.MY_PAYMENT });

  useEffect(() => {
    dispatch(fetchStudentProfileThunk());
  }, [dispatch]);

  useCachedEffect("my-payment", () => {
    dispatch(
      fetchAllPaymentsService({
        status: Constants.ACTIVE,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, currentPage, currentPageSize]);
  const handleOpenEditModal = (p: PaymentModel) => {
    setModalMode("edit");
    setInitialData({
      id: p.id,
      amount: p.amount,
      comment: p.commend,
      item: p.item,
      percentage: p.percentage,
      type: p.type,
    });
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
        await dispatch(createPaymentByTokenService(payload)).unwrap();
        toast.success("Payment added successfully");
        setIsModalOpen(false);
      } else if (modalMode === "edit" && formData.id) {
        await dispatch(updatePaymentByTokenService({ id: formData.id, data: payload })).unwrap();
        toast.success("Payment updated successfully");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  }

  async function handleDeletePayment() {
    if (!selectedPayment) return;
    try {
      await dispatch(deletePaymentService(selectedPayment.id)).unwrap();
      toast.success("Payment deleted successfully");
    } catch {
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
    }
    return `${studentDetail?.username}`;
  };

  const columns = createMyPaymentColumns({
    getDisplayIndex,
    isUpdating: operations.isUpdating,
    isDeleting: operations.isDeleting,
    onEdit: handleOpenEditModal,
    onDelete: (p) => { setSelectedPayment(p); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title={`View Student ${getStudentName()}`}
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Student payment", href: ROUTE.PAYMENT.VIEW_PAYMENT(id.toString()) },
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
              <Button onClick={handleAddNew} className="bg-green-900 text-white hover:bg-green-950">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>

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
            emptyMessage="No Records"
            getRowKey={(p) => p.id}
          />
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
