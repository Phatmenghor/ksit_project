"use client";
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
import { Search, ArrowLeft, Ghost } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { AppIcons } from "@/constants/icons/icon";
import { useIsMobile } from "@/hooks/use-mobile";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface CardHeaderSectionProps {
  breadcrumbs: BreadcrumbItemType[];
  title?: string;
  searchPlaceholder?: string;
  backHref?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  customAddNewButton?: React.ReactNode;
  buttonHref?: string;
  back?: boolean;
  openModal?: () => void;
  customSelect?: React.ReactNode;
  tabs?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeaderSection: React.FC<CardHeaderSectionProps> = ({
  breadcrumbs,
  title,
  searchPlaceholder = "Search...",
  searchValue,
  customAddNewButton,
  onSearchChange,
  buttonText,
  buttonIcon,
  children,
  backHref,
  back,
  buttonHref,
  openModal,
  customSelect,
  tabs,
}) => {
  const router = useRouter();

  const isMobile = useIsMobile();

  return (
    <div>
      <Card>
        <CardContent className="py-6 space-y-3">
          {/* Breadcrumb Section */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator
                      style={{
                        animationDelay: `${250 + index * 100}ms`,
                        animationFillMode: "backwards",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Title Section with Back Button */}
          <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-start">
            {back && !isMobile && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0 hover:cursor-pointer"
                asChild
                onClick={() => router.back()}
              >
                <img
                  src={AppIcons.Back}
                  alt="back Icon"
                  className="h-4 w-4 mr-5 text-muted-foreground"
                />
              </Button>
            )}

            {title && (
              <h3 className="lg:text-2xl text-lg font-bold text-gray-900">
                {title}
              </h3>
            )}
          </div>

          {/* Search and Actions Section */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search input */}
            {onSearchChange && (
              <div className="relative w-full md:w-[700px] group">
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

            {/* Right side actions */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              {customSelect && <div>{customSelect}</div>}

              {customAddNewButton && <div>{customAddNewButton}</div>}

              {buttonText && buttonHref && (
                <div>
                  <Link
                    href={{
                      pathname: buttonHref,
                    }}
                  >
                    <Button className="bg-teal-900 text-white hover:bg-teal-950 flex gap-1 h-10 hover:shadow-lg hover:shadow-green-900/25">
                      {buttonIcon && <span>{buttonIcon}</span>}
                      {buttonText}
                    </Button>
                  </Link>
                </div>
              )}

              {buttonText && openModal && (
                <div>
                  <Button
                    className="bg-teal-900 text-white hover:bg-teal-950 flex gap-1 h-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-900/25 group"
                    onClick={openModal}
                  >
                    {buttonIcon && (
                      <span className="duration-200 group-hover:scale-110">
                        {buttonIcon}
                      </span>
                    )}
                    {buttonText}
                  </Button>
                </div>
              )}
            </div>
          </div>
          {children && <div className="px-0 pb-0">{children}</div>}
        </CardContent>

        {/* Tabs Section */}
        {tabs && <div className="border-t px-6 ">{tabs}</div>}
      </Card>
    </div>
  );
};
