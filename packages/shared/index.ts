/// <reference types="node" />

// Shared type exports for the modular monolith

// UUID type for consistent ID usage
export type Id = string & { __type: "Id" };

// Date type for consistent timestamp usage
export type Timestamp = string & { __type: "Timestamp" };

// Status enum types
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

export const TicketStatusEnum = {
  OPEN: "open" as const,
  IN_PROGRESS: "in-progress" as const,
  RESOLVED: "resolved" as const,
  CLOSED: "closed" as const,
};

export type ExportDatasetType =
  | "tickets"
  | "customers"
  | "reports"
  | "finance"
  | "returns"
  | "fulfilment"
  | "service"
  | "analytics";

export const ExportDatasetTypeEnum = {
  TICKETS: "tickets" as const,
  CUSTOMERS: "customers" as const,
  REPORTS: "reports" as const,
  FINANCE: "finance" as const,
  RETURNS: "returns" as const,
  FULFILMENT: "fulfilment" as const,
  SERVICE: "service" as const,
  ANALYTICS: "analytics" as const,
};

// Role enum types
export type StaffRole = "staff" | "manager" | "admin";

export const StaffRoleEnum = {
  STAFF: "staff" as const,
  MANAGER: "manager" as const,
  ADMIN: "admin" as const,
};

// Sort enum types
export type SortOrder = "asc" | "desc";

export const SortOrderEnum = {
  ASC: "asc" as const,
  DESC: "desc" as const,
};

// Pagination
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  nextCursor?: string;
}

// Database query builder placeholder — to be replaced with real knex/sequelize
export interface QueryBuilder<T> {
  where: (condition: object) => QueryBuilder<T>;
  orderBy: (field: string, order?: SortOrder) => QueryBuilder<T>;
  limit: (n: number) => QueryBuilder<T>;
  offset: (n: number) => QueryBuilder<T>;
}

// Export all types
