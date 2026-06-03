"use client";
import React from "react";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import DynamicInputGrid from "@/components/shared/dynamicInputGrid";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { GenderEnum } from "@/constants/constant";

export default function FamilyStatusForm() {
  const {
    control,
    formState: { errors, isSubmitting },
  } = useFormContext();

  useFieldArray({
    control: control,
    name: "teacherFamily",
  });

  // Helper component to show error message
  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;

  return (
    <CollapsibleCard title="ស្ថានភាពគ្រួសារ">
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Family Status */}
        <div>
          <label
            htmlFor="family-status"
            className="mb-1 block text-sm font-bold"
          >
            ស្ថានភាពគ្រួស
          </label>
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <Input
                id="family-status"
                {...field}
                disabled={isSubmitting}
                placeholder="ឋានន្តរស័ក្តិ និងថ្នាក់..."
                className="bg-gray-100"
              />
            )}
          />
          <ErrorMessage message={errors.maritalStatus?.message?.toString()} />
        </div>

        {/* Relationship and Occupation */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="relation-to"
                className="mb-1 block text-sm font-bold"
              >
                ត្រូវជា
              </label>
              <Controller
                control={control}
                name="mustBe"
                render={({ field }) => (
                  <Input
                    id="relation-to"
                    {...field}
                    placeholder="ត្រូវជា..."
                    disabled={isSubmitting}
                    className="bg-gray-100"
                  />
                )}
              />
              <ErrorMessage message={errors.mustBe?.message?.toString()} />
            </div>
            <div>
              <label
                htmlFor="partner-job"
                className="mb-1 block text-sm font-bold"
              >
                មុខរបរសហព័ទ្ធ
              </label>
              <Controller
                control={control}
                name="affiliatedProfession"
                render={({ field }) => (
                  <Input
                    id="partner-job"
                    {...field}
                    disabled={isSubmitting}
                    placeholder="មុខរបរ..."
                    className="bg-gray-100"
                  />
                )}
              />
              <ErrorMessage
                message={errors.affiliatedProfession?.message?.toString()}
              />
            </div>
          </div>
        </div>

        {/* Partner Name */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="partner-name"
              className="mb-1 block text-sm font-bold"
            >
              ឈ្មោះសហព័ទ្ធ
            </label>
            <Controller
              control={control}
              name="federationName"
              render={({ field }) => (
                <Input
                  id="partner-lastname"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="នាមត្រកូល"
                  className="bg-gray-100"
                />
              )}
            />
            <ErrorMessage
              message={errors.federationName?.message?.toString()}
            />
          </div>

          <div>
            <label
              htmlFor="affiliatedOrganization"
              className="mb-1 block text-sm font-bold"
            >
              អង្គភាពសហព័ទ្ធ
            </label>
            <Controller
              control={control}
              name="affiliatedOrganization"
              render={({ field }) => (
                <Input
                  id="affiliatedOrganization"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="អង្គភាពសហព័ទ្ធ"
                  className="bg-gray-100"
                />
              )}
            />
            <ErrorMessage
              message={errors.affiliatedOrganization?.message?.toString()}
            />
          </div>
        </div>

        {/* Partner Birthdate and Salary */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="partner-dob"
              className="mb-1 block text-sm font-bold"
            >
              ថ្ងៃខែឆ្នាំកំណើតសហព័ទ្ធ
            </label>
            <Controller
              control={control}
              name="federationEstablishmentDate"
              render={({ field }) => (
                <input
                  id="partner-dob"
                  {...field}
                  disabled={isSubmitting}
                  type="date"
                  className="w-full bg-gray-100 py-2 px-3 border rounded-md pr-10"
                />
              )}
            />
            <ErrorMessage
              message={errors.federationEstablishmentDate?.message?.toString()}
            />
          </div>
          <div>
            <label
              htmlFor="partner-salary"
              className="mb-1 block text-sm font-bold"
            >
              ប្រាក់ខែប្រពន្ធ
            </label>
            <Controller
              control={control}
              name="wivesSalary"
              render={({ field }) => (
                <Input
                  id="partner-salary"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="ប្រាក់ខែ..."
                  className="bg-gray-100"
                />
              )}
            />
            <ErrorMessage message={errors.wivesSalary?.message?.toString()} />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-bold">
              លេខទូរស័ព្ទផ្ទាល់ខ្លួន
            </label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Input
                  id="phone"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="លេខទូរស័ព្ទ..."
                  className="bg-gray-100"
                />
              )}
            />
            <ErrorMessage message={errors.phoneNumber?.message?.toString()} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold">
              អ៊ីមែល
            </label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  id="email"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="example@email.com"
                  className="bg-gray-100"
                />
              )}
            />
            <ErrorMessage message={errors.email?.message?.toString()} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-bold">
            អាសយដ្ឋានបច្ចុប្បន្ន
          </label>
          <Controller
            control={control}
            name="currentAddress"
            render={({ field }) => (
              <Input
                id="address"
                {...field}
                disabled={isSubmitting}
                placeholder="អាសយដ្ឋាន..."
                className="bg-gray-100"
              />
            )}
          />
          <ErrorMessage message={errors.currentAddress?.message?.toString()} />
        </div>
      </div>

      {/* Children Info Grid */}
      <div className="mt-6">
        <DynamicInputGrid
          isSubmitting={isSubmitting}
          labels={["ឈ្មោះកូន", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "មុខរបរ"]}
          fields={[
            {
              name: "nameChild",
              type: "text",
              placeholder: "ឈ្មោះកូន",
            },
            {
              name: "gender",
              type: "select",
              placeholder: "ភេទ",
              options: [
                { label: "ប្រុស", value: GenderEnum.MALE },
                { label: "ស្រី", value: GenderEnum.FEMALE },
              ],
            },
            {
              name: "dateOfBirth",
              type: "date",
              placeholder: "ថ្ងៃខែឆ្នាំកំណើត",
            },
            {
              name: "working",
              type: "text",
              placeholder: "មុខរបរ",
            },
          ]}
          namePrefix="teacherFamily"
          defaultRows={2}
        />
      </div>
    </CollapsibleCard>
  );
}
