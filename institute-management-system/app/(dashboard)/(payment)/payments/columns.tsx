import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StudentModel } from "@/model/user/student/student.request.model";

export interface PaymentListColumnsProps {
  currentPage: number;
  currentPageSize: number;
}

export function createPaymentListColumns({
  currentPage,
  currentPageSize,
}: PaymentListColumnsProps): TableColumn<StudentModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "username", label: "Username", render: (s) => s.username || "---" },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (s) => `${s.khmerFirstName || ""} ${s.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (s) => `${s.englishFirstName || ""} ${s.englishLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (s) => s.gender || "---" },
    { key: "dateOfBirth", label: "Date of Birth", render: (s) => s.dateOfBirth || "---" },
    {
      key: "action",
      label: "Action",
      width: "100px",
      render: (s) => (
        <BreadcrumbLink href={ROUTE.PAYMENT.VIEW_PAYMENT(String(s.id))}>
          <Button
            variant="link"
            size="icon"
            className="text-black underline hover:text-blue-600 flex items-center"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm"> Detail</span>
          </Button>
        </BreadcrumbLink>
      ),
    },
  ];
}
