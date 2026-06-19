import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableColumn } from "@/components/shared/data-table";
import { PaymentModel } from "@/model/payment/payment-model";

export interface MyPaymentColumnsProps {
  getDisplayIndex: (index: number) => number;
  isUpdating: boolean;
  isDeleting: boolean;
  onEdit: (item: PaymentModel) => void;
  onDelete: (item: PaymentModel) => void;
}

export function createMyPaymentColumns({
  getDisplayIndex,
  isUpdating,
  isDeleting,
  onEdit,
  onDelete,
}: MyPaymentColumnsProps): TableColumn<PaymentModel>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    { key: "item", label: "Item", render: (p) => p.item },
    { key: "type", label: "Type", render: (p) => p.type },
    { key: "amount", label: "Amount", render: (p) => p.amount },
    { key: "percentage", label: "Percentage", render: (p) => p.percentage },
    { key: "date", label: "Date", render: (p) => p.date },
    { key: "commend", label: "Comment", render: (p) => p.commend },
    {
      key: "action",
      label: "Action",
      width: "100px",
      render: (p) => (
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onEdit(p)}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isUpdating}
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
                  onClick={() => onDelete(p)}
                  variant="ghost" size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
                  disabled={isDeleting}
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
