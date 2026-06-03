"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { GenderEnum } from "@/constants/constant";
import CollapsibleCard from "@/components/shared/collapsibleCard";

export default function PersonalHistoryForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const uniqueId = useId();

  return (
    <CollapsibleCard title="ប្រវត្តិផ្ទាល់គ្រូបង្រៀន">
      {/* Personal information section */}
      <div>
        <div className="grid mb-7 grid-cols-1 gap-4 md:grid-cols-2">
          {/* នាមត្រកូល និងនាមខ្លួន */}
          <div className="grid grid-cols-1 gap-2">
            <label
              htmlFor="khmer-full-name"
              className="mb-1 block text-sm font-bold"
            >
              នាមត្រកូល និងនាមខ្លួន
            </label>

            <div className="flex gap-2" id="khmerFirstName">
              <Controller
                name="khmerFirstName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="khmerFirstName"
                    {...field}
                    placeholder="នាមត្រកូល..."
                    disabled={isSubmitting}
                    className="w-1/2 bg-gray-100"
                  />
                )}
              />
              <Controller
                name="khmerLastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    placeholder="នាមខ្លួន..."
                    className="w-1/2 bg-gray-100"
                  />
                )}
              />
            </div>
          </div>
          {/* លេខគណនីបៀវត្ស */}
          <div>
            <label
              htmlFor="account-number"
              className="mb-1 block text-sm font-bold"
            >
              លេខគណនីបៀវត្ស
            </label>
            <Controller
              name="payrollAccountNumber"
              control={control}
              render={({ field }) => (
                <Input
                  id="account-number"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="លេខគណនីបៀវត្ស..."
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* ជាអក្សរឡាតាំង */}
          <div className="grid grid-cols-1 gap-2">
            <label
              htmlFor={`${uniqueId}-latin-full-name`}
              className="mb-1 block text-sm font-bold"
            >
              ជាអក្សរឡាតាំង
            </label>
            <div className="flex gap-2">
              <Controller
                name="englishFirstName"
                control={control}
                render={({ field }) => (
                  <Input
                    id={`${uniqueId}-latin-first-name`}
                    {...field}
                    disabled={isSubmitting}
                    placeholder="First name..."
                    className="w-1/2 bg-gray-100"
                  />
                )}
              />
              <Controller
                name="englishLastName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="latin-last-name"
                    {...field}
                    disabled={isSubmitting}
                    placeholder="Last name..."
                    className="w-1/2 bg-gray-100"
                  />
                )}
              />
            </div>
          </div>

          {/* លេខសមាជិកបសបខ */}
          <div>
            <label
              htmlFor="membership-number"
              className="mb-1 block text-sm font-bold"
            >
              លេខសមាជិកបសបខ
            </label>
            <Controller
              name="cppMembershipNumber"
              control={control}
              render={({ field }) => (
                <Input
                  id="membership-number"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="លេខសមាជិកបសបខ..."
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* ភេទ */}

          <div>
            <label htmlFor="gender" className="mb-1 block text-sm font-bold">
              ភេទ
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => {
                console.log("$$Gender field value:", field.value);
                console.log("$$Gender field value type:", typeof field.value);
                console.log("$$GenderEnum.MALE:", GenderEnum.MALE);
                console.log("$$GenderEnum.FEMALE:", GenderEnum.FEMALE);
                console.log(
                  "$$Are they equal?",
                  field.value === GenderEnum.MALE
                );

                return (
                  <Select
                    onValueChange={(value) => {
                      console.log("Select changed to:", value);
                      field.onChange(value);
                    }}
                    disabled={isSubmitting}
                    value={field.value || undefined}
                  >
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue placeholder="សូមជ្រើសរើស" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100">
                      <SelectItem value={GenderEnum.MALE}>ប្រុស</SelectItem>
                      <SelectItem value={GenderEnum.FEMALE}>ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>

          {/* ថ្ងៃខែឆ្នាំចូលបម្រើការងារ */}
          <div>
            <label
              htmlFor="start-Work-Date"
              className="mb-1 block text-sm font-bold"
            >
              ថ្ងៃខែឆ្នាំចូលបម្រើការងារ
            </label>
            <Controller
              name="startWorkDate"
              control={control}
              render={({ field }) => (
                <input
                  id="start-Work-Date"
                  type="date"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="mm/dd/yyyy"
                  className="w-full bg-gray-100 py-2 px-3 border rounded-md pr-10"
                />
              )}
            />
          </div>

          {/* ថ្ងៃខែឆ្នាំកំណើត */}
          <div>
            <label htmlFor="dob" className="mb-1 block text-sm font-bold">
              ថ្ងៃខែឆ្នាំកំណើត
            </label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <input
                  id="dob"
                  {...field}
                  disabled={isSubmitting}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="w-full bg-gray-100 py-2 px-3 border rounded-md pr-10"
                />
              )}
            />
          </div>

          {/* ថ្ងៃខែឆ្នាំតែងតាំងស៊ុប */}
          <div>
            <label
              htmlFor="appointment-date"
              className="mb-1 block text-sm font-bold"
            >
              ថ្ងៃខែឆ្នាំតែងតាំងស៊ុប
            </label>
            <Controller
              control={control}
              name="currentPositionDate"
              render={({ field }) => (
                <input
                  id="appointment-date"
                  type="date"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="mm/dd/yyyy"
                  className="w-full bg-gray-100 py-2 px-3 border rounded-md pr-10"
                />
              )}
            />
          </div>

          {/* ជនជាតិ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="ethnicity"
                className="mb-1 block text-sm font-bold"
              >
                ជនជាតិ
              </label>
              <Controller
                control={control}
                name="ethnicity"
                render={({ field }) => (
                  <Input
                    id="ethnicity"
                    type="text"
                    {...field}
                    disabled={isSubmitting}
                    placeholder="ជនជាតិ"
                    className="w-full bg-gray-100"
                  />
                )}
              />
            </div>

            {/*  ពិការ */}
            <div>
              <label htmlFor="disable" className="mb-1 block text-sm font-bold">
                ពិការ
              </label>
              <Controller
                name="disability"
                control={control}
                render={({ field }) => (
                  <Input
                    id="disable"
                    {...field}
                    disabled={isSubmitting}
                    placeholder="បញ្ហាពិការ..."
                    className="w-full bg-gray-100"
                  />
                )}
              />
            </div>
          </div>

          {/* {អង្គភាពបម្រើការងារ} */}
          <div>
            <label
              htmlFor="employee-work"
              className="mb-1 block text-sm font-bold"
            >
              អង្គភាពបម្រើការងារ
            </label>
            <Controller
              control={control}
              name="employeeWork"
              render={({ field }) => (
                <Input
                  id="employee-work"
                  type="text"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="អង្គភាពបម្រើការងារ..."
                  className="w-full bg-gray-100"
                />
              )}
            />{" "}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* អត្តលេខមន្ត្រី */}
            <div>
              <label
                htmlFor="staff-id"
                className="mb-1 block text-sm font-bold"
              >
                អត្តលេខមន្ត្រី
              </label>
              <Controller
                control={control}
                name="staffId"
                render={({ field }) => (
                  <Input
                    id="staff-id"
                    {...field}
                    disabled={isSubmitting}
                    placeholder="អត្តលេខមន្ត្រី..."
                    className="w-full bg-gray-100"
                  />
                )}
              />{" "}
            </div>
          </div>

          <div className="grid space-y-4">
            {/* Province, District, Commune, Village */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Village */}
              <div>
                <label
                  htmlFor="village"
                  className="mb-1 block text-sm font-bold"
                >
                  ភូមិ
                </label>
                <Controller
                  control={control}
                  name="village"
                  render={({ field }) => (
                    <Input
                      id="village"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="ភូមិ..."
                      className="w-full bg-gray-100"
                    />
                  )}
                />
              </div>

              {/* Commune / Sangkat */}
              <div>
                <label
                  htmlFor="commune"
                  className="mb-1 block text-sm font-bold"
                >
                  ឃុំ / សង្កាត់
                </label>
                <Controller
                  control={control}
                  name="commune"
                  render={({ field }) => (
                    <Input
                      id="commune"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="ឃុំ / សង្កាត់..."
                      className="w-full bg-gray-100"
                    />
                  )}
                />
              </div>

              {/* District / Khan */}
              <div>
                <label
                  htmlFor="district"
                  className="mb-1 block text-sm font-bold"
                >
                  ស្រុក / ខណ្ឌ
                </label>
                <Controller
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <Input
                      id="district"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="ស្រុក / ខណ្ឌ..."
                      className="w-full bg-gray-100"
                    />
                  )}
                />
              </div>

              {/* Province / Capital */}
              <div>
                <label
                  htmlFor="province"
                  className="mb-1 block text-sm font-bold"
                >
                  ខេត្ត / រាជធានី
                </label>
                <Controller
                  control={control}
                  name="province"
                  render={({ field }) => (
                    <Input
                      id="province"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="ខេត្ត / រាជធានី..."
                      className="w-full bg-gray-100"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* លេខអត្តសញ្ញាណបណ្ណ */}
          <div>
            <label
              htmlFor="national-Id"
              className="mb-1 block text-sm font-bold"
            >
              លេខអត្តសញ្ញាណបណ្ណ
            </label>
            <Controller
              control={control}
              name="nationalId"
              render={({ field }) => (
                <Input
                  id="national-Id"
                  type="texst"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="លេខអត្តសញ្ញាណបណ្ណ..."
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* ការិយាល័យe */}
          <div>
            <label
              htmlFor="staff-office"
              className="mb-1 block text-sm font-bold"
            >
              ការិយាល័យ
            </label>
            <Controller
              control={control}
              name="officeName"
              render={({ field }) => (
                <Input
                  id="staff-office"
                  type="text"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="ការិយាល័យ"
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* ទីកន្លែងកំណើត */}
          <div>
            <label htmlFor="Office" className="mb-1 block text-sm font-bold">
              ទីកន្លែងកំណើត
            </label>
            <Controller
              control={control}
              name="placeOfBirth"
              render={({ field }) => (
                <Input
                  id="Office"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="ទីកន្លែងកំណើត"
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* មុខតំណែង */}
          <div>
            <label htmlFor="position" className="mb-1 block text-sm font-bold">
              មុខតំណែង
            </label>
            <Controller
              control={control}
              name="currentPosition"
              render={({ field }) => (
                <Input
                  id="position"
                  {...field}
                  disabled={isSubmitting}
                  placeholder="មុខតំណែង..."
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>
        </div>
        {/* ប្រកាស */}
        <div className="mb-3">
          <label htmlFor="Posts" className="mb-1 block text-sm font-bold">
            ប្រកាស
          </label>
          <Controller
            control={control}
            name="decreeFinal"
            render={({ field }) => (
              <Input
                id="Posts"
                {...field}
                disabled={isSubmitting}
                placeholder="ប្រកាស..."
                className="bg-gray-100"
              />
            )}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
