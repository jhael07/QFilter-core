/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import QExecute from "./QExecute";
import {
  commonFilterProps,
  FilterGroupOperator,
  FilterLogicalOperator,
  FilterOperator,
  FiltersType,
  OperatorsType,
  QFilterGridify,
} from "./types/index";

/**
 * Class representing a filter for a dataset.
 * @template T - The type of data being filtered.
 * @extends QExecute<T>
 */
class QFilter<T> extends QExecute<T> {
  private buildFilters?: string;
  private filters: Array<FiltersType<T>> = [];
  private static operators: Record<string, string> = {
    Equals: `data?.{field} == {value}`,
    NotEquals: `data?.{field} !== {value}`,
    GreaterThan: `data?.{field} > {value}`,
    GreaterThanOrEqual: `data?.{field} >= {value}`,
    LessThan: `data?.{field} < {value}`,
    LessThanOrEqual: `data?.{field} <= {value}`,
    StartsWith: `data?.{field}?.toLowerCase()?.startsWith({value}.toLowerCase())`,
    NotStartsWith: `!data?.{field}?.toLowerCase()?.startsWith({value}.toLowerCase())`,
    EndsWith: `data?.{field}?.toLowerCase().endsWith({value}.toLowerCase())`,
    NotEndsWith: `!data?.{field}?.toLowerCase().endsWith({value}.toLowerCase())`,
    Contains: `data?.{field}?.toLowerCase()?.includes({value}.toLowerCase())`,
    NotContains: `!data?.{field}?.toLowerCase()?.includes({value}.toLowerCase())`,
    IsEmpty: `data?.{field}?.length == ''`,
    IsNotEmpty: "data?.{field}?.length != ''",
    IsNull: `data?.{field} == null`,
    IsNotNull: `data?.{field} != null`,
    IsUndefined: `data?.{field} == undefined`,
    IsNotUndefined: `data?.{field} != undefined`,
    IsDateGreaterThan: `new Date(data?.{field}?.split("T")[0]).getTime() > new Date({value}?.split("T")[0]).getTime()`,
    IsDateGreaterThanOrEqual: `new Date(data?.{field}?.split("T")[0]).getTime() >= new Date({value}?.split("T")[0]).getTime()`,
    IsDateLessThan: `new Date(data?.{field}?.split("T")[0]).getTime() < new Date({value}?.split("T")[0]).getTime()`,
    IsDateLessThanOrEqual: `new Date(data?.{field}?.split("T")[0]).getTime() <= new Date({value}?.split("T")[0]).getTime()`,
    IsDateEqualTo: `new Date(data?.{field}?.split("T")[0]).getTime() == new Date({value}?.split("T")[0]).getTime()`,
    IsDateNotEqualTo: `new Date(data?.{field}?.split("T")[0]).getTime() != new Date({value}?.split("T")[0]).getTime()`,
  };

  private static gridifyCompare: { [key in keyof OperatorsType]?: string } = {
    Equals: "=",
    NotEquals: "!=",
    LessThan: "<",
    GreaterThan: ">",
    GreaterThanOrEqual: ">=",
    LessThanOrEqual: "<=",
    Contains: "=*",
    NotContains: "!*",
    StartsWith: "^",
    NotStartsWith: "!^",
    EndsWith: "$",
    NotEndsWith: "!$",
    IsDateEqualTo: "=",
    IsDateGreaterThan: ">",
    IsDateGreaterThanOrEqual: ">=",
    IsDateLessThan: "<",
    IsDateLessThanOrEqual: "<=",
    IsDateNotEqualTo: "!=",
    IsEmpty: "=",
    IsNotEmpty: "!=",
    IsNotNull: "!=",
    IsNotUndefined: "!=",
    IsNull: "=",
    IsUndefined: "=",
  };

  public filtersApplied: number;

  /**
   * Creates an instance of QFilter.
   * @param {Array<FiltersType<T>>} filters - An array of filters to be applied.
   */
  constructor(filters: Array<FiltersType<T>>) {
    super();
    this.filters = filters;
    this.filtersApplied = filters.length;
  }

  /**
   * Dynamically generates a filter expression based on the provided filter item.
   * Modifies the `buildFilters` property of the class instance.
   * @param {commonFilterProps<T> | FilterOperator<T> | FilterGroupOperator<T> | FilterLogicalOperator<T>} item The filter item to generate the expression for.
   */
  private generateFilter(
    item:
      | commonFilterProps<T>
      | FilterOperator<T>
      | FilterGroupOperator<T>
      | FilterLogicalOperator<T>
  ): void {
    if (!item) return;

    if (!this.buildFilters) this.buildFilters = "";

    if (item.type === "comparisonOperator") {
      const { field, operator, value } = item as FilterOperator<T>;
      const newVal = typeof value === "string" ? `'${value}'` : value;

      this.buildFilters += QFilter.operators[operator]
        .replace(/\{field}/g, field.toString())
        .replace(/\{value}/g, newVal?.toString() ?? "");

      return;
    }

    if (item.type === "logicalOperator") {
      this.buildFilters = this.buildFilters.concat(
        ` ${(item as FilterLogicalOperator<T>).operator} `
      );
      return;
    }

    if (item.type === "group") {
      this.buildFilters = this.buildFilters.concat(`(`);
      item.children?.forEach((item) => {
        this.generateFilter(item);
      });

      this.buildFilters = this.buildFilters.concat(`)`);
      return;
    }
  }

  private formatComparisonOperatorGridify(item?: FilterOperator<unknown>): string {
    if (!item?.field) return "";
    return (
      `${item?.field.toString().replace(/\?/g, "")}` +
      QFilter.gridifyCompare[item.operator as keyof OperatorsType] +
      item.value
    );
  }

  private formatLogicalOperatorGridify(item: FilterOperator<unknown>): string {
    if (item.operator.toString() === "&&") return ",";
    if (item.operator.toString() === "||") return "|";
    return "";
  }

  private formatGroupOperatorGridify(item: FilterOperator<unknown>, gridifyFilters: string): void {
    gridifyFilters += "(";
    gridifyFilters = this.executeGridify(item.children, gridifyFilters);
    gridifyFilters += ")";
  }

  /**
   * Translates an array of filters into a string compatible with the Gridify API.
   *
   * @param {FiltersType<T>[]} [filters] - An array of filters to be translated.
   * @param {string} [gridifyFilters] - The string where filters are concatenated.
   * @returns {string} A string representing all filters in a format compatible with Gridify.
   */
  private executeGridify(filters?: FiltersType<T>[], gridifyFilters?: string): string {
    const itemFilters = filters ?? this.filters;
    let gridifyLocalFilters = gridifyFilters ?? "";

    itemFilters?.forEach((x) => {
      const item = x as FilterOperator<unknown>;

      if (item.type === "comparisonOperator")
        gridifyLocalFilters += this.formatComparisonOperatorGridify(item);

      if (item.type === "logicalOperator")
        gridifyLocalFilters += this.formatLogicalOperatorGridify(item);

      if (item.type === "group") this.formatGroupOperatorGridify(item, gridifyLocalFilters);
    });

    return gridifyLocalFilters;
  }

  /**
   * Generates the Gridify filter string along with pagination details.
   *
   * @returns {QFilterGridify} An object containing the filter string and pagination settings.
   */

  public gridify(): QFilterGridify {
    const gridifyFilters = this.executeGridify(this.filters);
    return { filter: gridifyFilters, orderBy: "", page: 0, pageSize: 0 };
  }

  /**
   * Applies the built filters to the provided dataSource and returns filtered results.
   * @param {T[]} dataSource The array of data to filter.
   * @returns {readonly T[]} An array of filtered data matching the applied filters.
   */
  public filter(dataSource: T[]): T[] {
    try {
      if (!this.buildFilters) {
        this.buildFilters = "";
        this.filters?.forEach((item) => this.generateFilter(item));
      }

      return this.QExecute(this.buildFilters, dataSource) as T[];
    } catch (err: any) {
      return [];
    }
  }
}

export default QFilter;
