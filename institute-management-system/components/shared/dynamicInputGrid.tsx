"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import React, { useEffect, useRef } from "react";

type FieldType = "text" | "date" | "select";

interface FieldConfig {
  name: string;
  type: FieldType;
  placeholder: string;
  key?: string;
  options?: { label: string; value: string }[];
}

interface Props {
  labels: string[];
  isSubmitting: boolean;
  fields: FieldConfig[];
  defaultRows?: number;
  namePrefix: string;
}

export default function DynamicInputGrid({
  labels,
  fields,
  isSubmitting,
  defaultRows = 1,
  namePrefix,
}: Props) {
  const { control, getValues } = useFormContext();
  const initializedRef = useRef(false);

  const {
    fields: arrayFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: namePrefix,
  });

  // Initialize rows only once and only when needed
  useEffect(() => {
    if (initializedRef.current) return;

    const current = getValues(namePrefix);

    // Only append default rows if current data is truly undefined (not just empty)
    if (!Array.isArray(current)) {
      for (let i = 0; i < defaultRows; i++) {
        append(Object.fromEntries(fields.map((f) => [f.name, ""])));
      }
    }

    initializedRef.current = true;
  }, [getValues, append, fields, namePrefix, defaultRows]);

  const handleRemoveRow = (index: number) => {
    if (arrayFields.length > 1) {
      remove(index);
    }
  };

  return (
    <div
      className="border p-4 rounded-md shadow-sm space-y-4 overflow-x-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#000000 #d1d5db",
      }}
    >
      {/* Header */}
      <div
        className="grid gap-4 font-bold text-sm"
        style={{
          gridTemplateColumns: `repeat(${fields.length}, minmax(200px, 1fr)) auto`,
        }}
      >
        {labels.map((label, idx) => (
          <div key={idx} className="whitespace-nowrap">
            {label}
          </div>
        ))}
        <div className="whitespace-nowrap">Actions</div>
      </div>

      {/* Rows */}
      {arrayFields.map((fieldRow, rowIndex) => (
        <div
          key={fieldRow.id}
          className="grid gap-4 items-center"
          style={{
            gridTemplateColumns: `repeat(${fields.length}, minmax(200px, 1fr)) auto`,
          }}
        >
          {fields.map((field, colIndex) => {
            const inputName = `${namePrefix}.${rowIndex}.${field.name}`;
            const key = field.key ?? `${field.name}-${rowIndex}-${colIndex}`;

            return (
              <div key={key} className="relative">
                <Controller
                  name={inputName}
                  control={control}
                  render={({ field: controllerField }) => {
                    const safeValue = controllerField.value ?? "";

                    if (field.type === "date") {
                      return (
                        <Input
                          type="date"
                          disabled={isSubmitting}
                          placeholder={field.placeholder}
                          className="bg-gray-100"
                          {...controllerField}
                          value={safeValue}
                        />
                      );
                    }

                    if (field.type === "select") {
                      return (
                        <select
                          disabled={isSubmitting}
                          className={`w-full py-2 px-3 border rounded-md pr-10 ${
                            isSubmitting
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                              : "bg-gray-100 text-black border-gray-300"
                          }`}
                          {...controllerField}
                          value={safeValue}
                        >
                          <option value="">{field.placeholder}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    return (
                      <Input
                        disabled={isSubmitting}
                        type="text"
                        placeholder={field.placeholder}
                        className="bg-gray-100"
                        {...controllerField}
                        value={safeValue}
                      />
                    );
                  }}
                />
              </div>
            );
          })}

          {/* Remove button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRemoveRow(rowIndex)}
              disabled={isSubmitting || arrayFields.length === 1}
              className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add Row Button */}
      <div className="flex items-center gap-4 mt-4">
        <span className="text-sm font-medium w-24 border border-gray-300 px-4 rounded-md py-2">
          {arrayFields.length}
        </span>
        <Button
          disabled={isSubmitting}
          type="button"
          onClick={() =>
            append(Object.fromEntries(fields.map((f) => [f.name, ""])))
          }
          className="bg-black text-white hover:bg-gray-800"
        >
          បន្ថែមជួរថ្មី
        </Button>
      </div>
    </div>
  );
}
