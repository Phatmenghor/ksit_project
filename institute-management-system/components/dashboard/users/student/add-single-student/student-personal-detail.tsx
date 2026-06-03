"use client";
import CollapsibleCard from "@/components/shared/collapsibleCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { studentStatuses } from "@/constants/constant";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

export default function StudentPersonalDetailSection() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <CollapsibleCard title="ប្រវត្តិផ្ទាល់">
      <div className="grid mb-7 grid-cols-1 gap-6 md:grid-cols-2">
        {/* Khmer Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="khmer-full-name" className="text-sm font-bold">
            នាមត្រកូល និងនាមខ្លួន
          </label>
          <div className="flex gap-2" id="khmer-full-name">
            <Controller
              control={control}
              name="khmerFirstName"
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
              control={control}
              name="khmerLastName"
              render={({ field }) => (
                <Input
                  id="khmerLastName"
                  {...field}
                  placeholder="នាមខ្លួន..."
                  disabled={isSubmitting}
                  className="w-1/2 bg-gray-100"
                />
              )}
            />
          </div>
        </div>

        {/* Latin Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="latin-full-name" className="text-sm font-bold">
            ជាអក្សរឡាតាំង
          </label>
          <div className="flex gap-2" id="latin-full-name">
            <Controller
              control={control}
              name="englishFirstName"
              render={({ field }) => (
                <Input
                  id="englishFirstName"
                  {...field}
                  placeholder="First name..."
                  disabled={isSubmitting}
                  className="w-1/2 bg-gray-100"
                />
              )}
            />
            <Controller
              control={control}
              name="englishLastName"
              render={({ field }) => (
                <Input
                  id="englishLastName"
                  {...field}
                  placeholder="Last name..."
                  disabled={isSubmitting}
                  className="w-1/2 bg-gray-100"
                />
              )}
            />
          </div>
        </div>

        {/* Nationality & Ethnicity */}
        <div className="flex gap-4">
          <div className="flex flex-col flex-1 gap-2">
            <label htmlFor="nationality" className="text-sm font-bold">
              ជនជាតិ
            </label>
            <Controller
              control={control}
              name="nationality"
              render={({ field }) => (
                <Input
                  id="nationality"
                  {...field}
                  placeholder="ជនជាតិ..."
                  disabled={isSubmitting}
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <label htmlFor="ethnicity" className="text-sm font-bold">
              សញ្ជាតិ
            </label>
            <Controller
              control={control}
              name="ethnicity"
              render={({ field }) => (
                <Input
                  id="ethnicity"
                  {...field}
                  placeholder="សញ្ជាតិ..."
                  disabled={isSubmitting}
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>
        </div>

        {/* Gender & Date of Birth */}
        <div className="flex gap-4">
          <div className="flex flex-col flex-1 gap-2">
            <label htmlFor="gender" className="text-sm font-bold">
              ភេទ
            </label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="gender" className="bg-gray-100">
                    <SelectValue placeholder="សូមជ្រើសរើសភេទ">
                      {field.value === "MALE"
                        ? "ប្រុស"
                        : field.value === "FEMALE"
                        ? "ស្រី"
                        : "សូមជ្រើសរើសភេទ"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100">
                    <SelectItem value="MALE">ប្រុស</SelectItem>
                    <SelectItem value="FEMALE">ស្រី</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <label htmlFor="dateOfBirth" className="text-sm font-bold">
              ថ្ងៃខែឆ្នាំកំណើត
            </label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <input
                  id="dateOfBirth"
                  type="date"
                  className="w-full bg-gray-100 border border-input rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          {/* Phone Number */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="phoneNumber" className="text-sm font-bold">
              លេខទូរស័ព្ទ
            </label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Input
                  id="phoneNumber"
                  {...field}
                  placeholder="លេខទូរស័ព្ទ..."
                  disabled={isSubmitting}
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="email" className="text-sm font-bold">
              អ៊ីម៊ែល
            </label>
            <Controller
              control={control}
              name="email"
              defaultValue=""
              render={({ field }) => (
                <Input
                  id="email"
                  {...field}
                  placeholder="អ៊ីម៊ែល..."
                  disabled={isSubmitting}
                  className="w-full bg-gray-100"
                />
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="text-sm font-bold">
            ស្ថានភាព
          </label>
          <Controller
            name="studentStatus"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger id="studentStatus" className="bg-gray-100">
                  <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100">
                  {studentStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Place of Birth */}
        <div className="flex flex-col gap-2">
          <label htmlFor="placeOfBirth" className="text-sm font-bold">
            ទីកន្លែងកំណើត
          </label>
          <Controller
            name="placeOfBirth"
            control={control}
            render={({ field }) => (
              <Textarea
                id="placeOfBirth"
                {...field}
                placeholder="ភូមិ ​ឃុំ/សង្កាត់ ស្រុក/ខណ្ច​ ខេត្ត..."
                disabled={isSubmitting}
                className="w-full bg-gray-100"
              />
            )}
          />
        </div>

        {/* Current Address */}
        <div className="flex flex-col gap-2">
          <label htmlFor="currentAddress" className="text-sm font-bold">
            ទីកន្លែងបច្ចុប្បន្ន
          </label>
          <Controller
            control={control}
            name="currentAddress"
            render={({ field }) => (
              <Textarea
                id="currentAddress"
                {...field}
                placeholder="ភូមិ ​ឃុំ/សង្កាត់ ស្រុក/ខណ្ច​ ខេត្ត..."
                disabled={isSubmitting}
                className="w-full bg-gray-100"
              />
            )}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
