import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableColumn } from "@/components/shared/data-table";
import { PaymentModel } from "@/model/payment/payment-model";

export interface PaymentDetailColumnsProps {
  getDisplayIndex: (index: number) => number;
  isSubmitting: boolean;
  onEdit: (item: PaymentModel) => void;
  onDelete: (item: PaymentModel) => void;
}

export function createPaymentDetailColumns({
  getDisplayIndex,
  isSubmitting,
  onEdit,
  onDelete,
}: PaymentDetailColumnsProps): TableColumn<PaymentModel>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    { key: "item", label: "Item", render: (pay) => pay.item },
    { key: "type", label: "Type", render: (pay) => pay.type },
    { key: "amount", label: "Amount", render: (pay) => pay.amount },
    { key: "percentage", label: "Percentage", render: (pay) => pay.percentage },
    { key: "date", label: "Date", render: (pay) => pay.date },
    { key: "commend", label: "Comment", render: (pay) => pay.commend },
    {
      key: "actions",
      label: "",
      width: "100px",
      render: (pay) => (
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onEdit(pay)}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onDelete(pay)}
                  variant="ghost" size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
}
