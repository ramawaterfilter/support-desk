import { describe, expect, it } from "vitest";
import type { Id } from "../shared";
import { validateExportAccess, validateNoAutoMerge } from "./index";

const ticketsExport = (authorizedRoles: Array<"staff" | "manager" | "admin">) => ({
  id: "1",
  name: "Tickets Export",
  description: "",
  datasetType: "tickets" as const,
  authorizedRoles,
  quarantine: true,
  typeChecksum: "sha256:test",
});

describe("validateExportAccess (REQ-025 fail-closed)", () => {
  it("denies every role when authorizedRoles is empty", () => {
    expect(validateExportAccess("staff", ticketsExport([]), "csv").authorized).toBe(false);
    expect(validateExportAccess("manager", ticketsExport([]), "csv").authorized).toBe(false);
  });

  it("allows only a listed role", () => {
    expect(validateExportAccess("staff", ticketsExport(["staff"]), "csv").authorized).toBe(true);
    expect(validateExportAccess("admin", ticketsExport(["staff"]), "csv").authorized).toBe(false);
  });

  it("denies quarantined exports without a file type", () => {
    // fileType is typed as "csv" | "json"; simulate a bypassed caller with an empty value
    const result = validateExportAccess("staff", ticketsExport(["staff"]), "" as "csv");
    expect(result.authorized).toBe(false);
  });
});

describe("validateNoAutoMerge (REQ-001 household contacts)", () => {
  it("refuses to merge two persons sharing one contact", () => {
    const result = validateNoAutoMerge(
      { contact: "home@example.com", customerId: "CUST-1" as Id },
      { contact: "home@example.com", customerId: "CUST-2" as Id },
    );
    expect(result.valid).toBe(false);
  });

  it("keeps the same person valid", () => {
    const result = validateNoAutoMerge(
      { contact: "home@example.com", customerId: "CUST-1" as Id },
      { contact: "home@example.com", customerId: "CUST-1" as Id },
    );
    expect(result.valid).toBe(true);
  });
});
