export type OP =
  | "Equals"
  | "NotEquals"
  | "LessThan"
  | "GreaterThan"
  | "GreaterThanOrEqual"
  | "LessThanOrEqual"
  | "Contains"
  | "NotContains"
  | "StartsWith"
  | "NotStartsWith"
  | "EndsWith"
  | "NotEndsWith"
  | "IsEmpty"
  | "IsNotEmpty"
  | "IsNull"
  | "IsNotNull"
  | "IsDateGreaterThan"
  | "IsDateGreaterThanOrEqual"
  | "IsDateLessThan"
  | "IsDateLessThanOrEqual"
  | "IsDateEqualTo"
  | "IsDateNotEqualTo"
  | "IsUndefined"
  | "IsNotUndefined"
  | ComparisonOperator;

export type FilterType = "group" | "logicalOperator" | "comparisonOperator" | "dateOperator";

export type FilterGroup = "(" | ")";

export type LogicalOperator = "&&" | "||" | "!";

export type ComparisonOperator = "===" | "!==" | ">" | "<" | ">=" | "<=";
