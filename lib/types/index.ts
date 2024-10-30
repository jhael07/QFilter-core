/* eslint-disable @typescript-eslint/no-explicit-any */

import { FilterGroup, FilterType, LogicalOperator, OP } from "./operations";

export type commonFilterProps<T> = {
  id: string | number;
  parentId?: string | number | null;
  type: FilterType;
  children?: Array<GroupCondition<T>>;
};

export type FilterLogicalOperator<T> = {
  operator: LogicalOperator;
} & commonFilterProps<T>;

export type FilterGroupOperator<T> = {
  operator: FilterGroup;
} & commonFilterProps<T>;

export type FilterOperator<T> = {
  operator: OP;
  value: string | number | boolean | undefined | null;
  field: keyof T | string;
} & commonFilterProps<T>;

export type FilterBuild<T> = FilterGroupOperator<T> | FilterLogicalOperator<T> | FilterOperator<T>;

export type AddFilterFn<T> = (
  id: string | number,
  field: keyof T,
  operator: OP,
  value: number | string | boolean,
  parentId: string | number
) => FilterOperator<T>;

export type GroupCondition<T> =
  | FilterOperator<T>
  | FilterGroupOperator<T>
  | FilterLogicalOperator<T>
  | commonFilterProps<T>;

export type BuildResult<T> = { conditions: Readonly<string>; result: ReadonlyArray<T> };

export type FiltersType<T> =
  | FilterOperator<T>
  | FilterGroupOperator<T>
  | FilterLogicalOperator<T>
  | commonFilterProps<T>;

export type FiltersUI<T> = FilterOperator<T>;

export type QFilterGridify = {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  filter: string;
};

export type SelectOption = {
  label: string | number;
  value: string | number | boolean | undefined | null;
};

export enum ERROR_CODES {
  EmptyColumn = 1,
  EmptyOperator = 2,
  EmptyValue = 3,
  StartWithLogicalOperator = 4,
  GroupEmpty = 5,
}

export type Join<T> = T extends object
  ? T extends Array<any>
    ? "length"
    : {
        [K in keyof T]-?: `${Exclude<K, symbol>}${
          | ""
          | `${undefined extends T[K] | null ? "?" : "?"}.${Join<NonNullable<T[K]>>}`}`;
      }[keyof T]
  : never;

const logicalOperationCondition = (type: LogicalOperator) => {
  if (type === "&&") return "And";
  if (type === "||") return "Or";
  if (type === "!") return "Not";
};

export { logicalOperationCondition };

export enum OPERATORS {
  "Equals" = "Equals",
  "NotEquals" = "NotEquals",
  "LessThan" = "LessThan",
  "GreaterThan" = "GreaterThan",
  "GreaterThanOrEqual" = "GreaterThanOrEqual",
  "LessThanOrEqual" = "LessThanOrEqual",
  "Contains" = "Contains",
  "NotContains" = "NotContains",
  "StartsWith" = "StartsWith",
  "NotStartsWith" = "NotStartsWith",
  "EndsWith" = "EndsWith",
  "NotEndsWith" = "NotEndsWith",
  "IsEmpty" = "IsEmpty",
  "IsNotEmpty" = "IsNotEmpty",
  "IsNull" = "IsNull",
  "IsNotNull" = "IsNotNull",
  "IsDateGreaterThan" = "IsDateGreaterThan",
  "IsDateGreaterThanOrEqual" = "IsDateGreaterThanOrEqual",
  "IsDateLessThan" = "IsDateLessThan",
  "IsDateLessThanOrEqual" = "IsDateLessThanOrEqual",
  "IsDateEqualTo" = "IsDateEqualTo",
  "IsDateNotEqualTo" = "IsDateNotEqualTo",
  "IsUndefined" = "IsUndefined",
  "IsNotUndefined" = "IsNotUndefined",
}

export type OperatorsType = {
  Equals: string;
  NotEquals: string;
  LessThan: string;
  GreaterThan: string;
  GreaterThanOrEqual: string;
  LessThanOrEqual: string;
  Contains: string;
  NotContains: string;
  StartsWith: string;
  NotStartsWith: string;
  EndsWith: string;
  NotEndsWith: string;
  IsEmpty: string;
  IsNotEmpty: string;
  IsNull: string;
  IsNotNull: string;
  IsDateGreaterThan: string;
  IsDateGreaterThanOrEqual: string;
  IsDateLessThan: string;
  IsDateLessThanOrEqual: string;
  IsDateEqualTo: string;
  IsDateNotEqualTo: string;
  IsUndefined: string;
  IsNotUndefined: string;
};
