"use client";
import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PaymentTabs = () => {
  const router = useRouter();
  const [fees, setFees] = useState([
    {
      id: 1,
      item: "Admin Fee",
      type: "Pay",
      percentage: "0",
      amount: "10",
      date: "",
      comment: "",
    },
    {
      id: 2,
      item: "Book",
      type: "Pay",
      percentage: "0",
      amount: "50",
      date: "",
      comment: "",
    },
    {
      id: 3,
      item: "Certificate",
      type: "Free",
      percentage: "0",
      amount: "0",
      date: "",
      comment: "",
    },
    {
      id: 4,
      item: "School Fee",
      type: "Scholarship",
      percentage: "100",
      amount: "0",
      date: "",
      comment: "Semester 1 - Year 1",
    },
  ]);

  const typeOptions = ["Pay", "Free", "Scholarship"];

  const updateFee = (id: any, field: any, value: any) => {
    setFees(
      fees.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee))
    );
  };

  const deleteFee = (id: any) => {
    setFees(fees.filter((fee) => fee.id !== id));
  };

  const addRow = () => {
    const newId = Math.max(...fees.map((f) => f.id)) + 1;
    setFees([
      ...fees,
      {
        id: newId,
        item: "",
        type: "Pay",
        percentage: "0",
        amount: "0",
        date: "",
        comment: "",
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">ការបង់ថ្លៃសិក្សា</h3>

          <Separator />

          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-4 py-3 text-left font-medium">Item</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Percentage (%)
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Amount ($)
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Comment</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fees.map((fee, index) => (
                    <tr
                      key={fee.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={fee.item}
                          onChange={(e) =>
                            updateFee(fee.id, "item", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-100 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Enter item name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={fee.type}
                          onValueChange={(value) =>
                            updateFee(fee.id, "type", value)
                          }
                        >
                          <SelectTrigger className="w-full px-3 py-2 bg-gray-100 border-0 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {fee.type}
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={fee.percentage}
                          onChange={(e) =>
                            updateFee(fee.id, "percentage", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-100 border-0 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={fee.amount}
                          onChange={(e) =>
                            updateFee(fee.id, "amount", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-100 border-0 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <Input
                            type="date"
                            value={fee.date}
                            onChange={(e) =>
                              updateFee(fee.id, "date", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-100 border-0 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={fee.comment}
                          onChange={(e) =>
                            updateFee(fee.id, "comment", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-100 border-0 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Add Comment"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          onClick={() => deleteFee(fee.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-medium w-24 border border-gray-300 px-4 rounded-md py-2">
                {fees.length}
              </span>
              <Button
                onClick={addRow}
                className="flex items-center gap-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Discard
            </Button>
            <Button className="px-6 py-2 text-white bg-green-700 rounded hover:bg-green-800 transition-colors">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTabs;
