// components/CardHeaderSection.tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusEnum } from "@/constants/constant";
import { useRouter } from "next/navigation";

// ...imports remain the same

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface CardHeaderSectionProps {
  breadcrumbs: BreadcrumbItemType[];
  title: string;
  searchPlaceholder?: string;
  backHref?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonHref?: string;
  back: boolean;
  openModal?: () => void;
  customSelect?: React.ReactNode; // 👈 new optional prop
}

export const StudentCardHeaderSection: React.FC<CardHeaderSectionProps> = ({
  breadcrumbs,
  title,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  buttonText,
  buttonIcon,
  backHref,
  back,
  buttonHref,
  openModal,
  customSelect, // 👈 receive here
}) => {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink
                      className={index === 0 ? "font-bold" : ""}
                      href={item.href}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator
                    className={index === 0 ? "font-bold" : ""}
                  />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-start gap-4">
          {backHref ? (
            <Link href={backHref}>
              <ArrowLeft />
            </Link>
          ) : back ? (
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft />
            </Button>
          ) : null}
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Search input */}
          {onSearchChange && (
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-8 w-full"
                value={searchValue}
                onChange={onSearchChange}
              />
            </div>
          )}

          {/* Right side: Custom Select and Add Button */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {customSelect && customSelect}
            </div>

            {buttonText && buttonHref && (
              <Link href={buttonHref}>
                <Button className="bg-green-900 text-white hover:bg-green-950 flex gap-1">
                  {buttonIcon}
                  {buttonText}
                </Button>
              </Link>
            )}
            {buttonText && openModal && (
              <Button
                className="bg-green-900 text-white hover:bg-green-950 flex gap-1"
                onClick={openModal}
              >
                {buttonIcon}
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
