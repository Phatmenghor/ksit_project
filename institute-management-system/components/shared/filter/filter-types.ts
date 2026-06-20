import React from "react";

export type FilterType = "select" | "input-text" | "input-number" | "date" | "year" | "custom";

export interface FilterOption {
  value: string | number;
  label: string;
}

interface BaseFilterConfig {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: "select";
  options: FilterOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number | null | undefined) => void;
}

export interface InputTextFilterConfig extends BaseFilterConfig {
  type: "input-text";
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface InputNumberFilterConfig extends BaseFilterConfig {
  type: "input-number";
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
}

export interface DateFilterConfig extends BaseFilterConfig {
  type: "date";
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export interface YearFilterConfig extends BaseFilterConfig {
  type: "year";
  value: number | undefined;
  onChange: (value: number) => void;
  minYear?: number;
  maxYear?: number;
}

export interface CustomFilterConfig extends BaseFilterConfig {
  type: "custom";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  render: (props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value: any) => void;
    disabled?: boolean;
    label: string;
    placeholder?: string;
  }) => React.ReactNode;
}

export type FilterConfig =
  | SelectFilterConfig
  | InputTextFilterConfig
  | InputNumberFilterConfig
  | DateFilterConfig
  | YearFilterConfig
  | CustomFilterConfig;

export interface FilterPanelConfig {
  title: string;
  totalCount?: number;
  subtitle?: string;
  onBack?: () => void;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters?: FilterConfig[];
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  onButtonClick?: () => void;
  extraActions?: React.ReactNode;
  onClearAll?: () => void;
}
