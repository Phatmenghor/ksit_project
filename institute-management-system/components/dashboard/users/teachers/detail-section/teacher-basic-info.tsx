"use client";

import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";

export function BasicInformationForm() {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentModel | null>(null);
  const {
    setValue,
    formState: { isSubmitting, errors },
    control,
  } = useFormContext();

  const handleDepartmentChange = (department: DepartmentModel) => {
    setSelectedDepartment(department);
    setValue("departmentId", department.id as number, {
      shouldValidate: true,
    });
  };

  return (
    <Card>
      <CardContent className="p-6 w-full">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Generate data
        </h2>
        <Separator className="mb-3" />
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="user-name"
                className="block mb-2 text-sm font-medium"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <>
                    <Input
                      id="user-name"
                      {...field}
                      placeholder="Username..."
                      disabled={isSubmitting}
                      className="bg-gray-100"
                      required
                    />
                    {errors.username &&
                      typeof errors.username === "object" &&
                      "message" in errors.username && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.username.message as string}
                        </p>
                      )}
                  </>
                )}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <>
                    <Input
                      id="password"
                      {...field}
                      type="password"
                      disabled={isSubmitting}
                      className="bg-gray-100"
                      placeholder="Password..."
                      required
                    />
                    {errors.password &&
                      typeof errors.password === "object" &&
                      "message" in errors.password &&
                      typeof errors.password.message === "string" && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.password.message}
                        </p>
                      )}
                  </>
                )}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="identify-number"
                className="block mb-2 text-sm font-medium"
              >
                Identify number <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="identifyNumber"
                render={({ field }) => (
                  <>
                    <Input
                      id="identify-number"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="-"
                      className="bg-gray-100"
                      required
                    />
                    {errors.identifyNumber &&
                      typeof errors.identifyNumber === "object" &&
                      "message" in errors.identifyNumber &&
                      typeof errors.identifyNumber.message === "string" && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.identifyNumber.message}
                        </p>
                      )}
                  </>
                )}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <FormField
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <>
                    <FormItem {...field}>
                      <FormLabel>
                        Department <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectDepartment
                          dataSelect={selectedDepartment}
                          onChangeSelected={handleDepartmentChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
