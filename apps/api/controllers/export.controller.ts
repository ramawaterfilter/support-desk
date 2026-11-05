import { Request, Response } from "express";
import { ExportDatasetType, StaffRole } from "../../../packages/shared";
import { validateExportAccess, ExportDefinition } from "../../../packages/policy";
import { randomUUID } from "node:crypto";
import type { AuthedRequest } from "../types";

// List available export datasets (8 datasets per HLD functional scope)
export function listExports(req: Request, res: Response) {
  const datasets: ExportDefinition[] = [
    {
      id: "1",
      name: "Tickets Export",
      description: "All ticket data including status, priority, assignee, and revision history",
      datasetType: "tickets",
      authorizedRoles: ["staff", "manager"],
      quarantine: true,
      typeChecksum: "sha256:abc123def456",
    },
    {
      id: "2",
      name: "Customers Export",
      description:
        "Customer master data with canonical identities and household contact disambiguation",
      datasetType: "customers",
      authorizedRoles: ["staff", "manager"],
      quarantine: true,
      typeChecksum: "sha256:def789abc123",
    },
    {
      id: "3",
      name: "Reports Export",
      description:
        "Analytics reports with cohort analysis, first-miss metrics, and drill-down capabilities",
      datasetType: "reports",
      authorizedRoles: ["manager", "admin"],
      quarantine: true,
      typeChecksum: "sha256:789abc1234",
    },
    {
      id: "4",
      name: "Finance Export",
      description:
        "Financial data including transaction history, refund authorities, and financial attempts",
      datasetType: "finance",
      authorizedRoles: ["manager", "admin"],
      quarantine: true,
      typeChecksum: "sha256:123abc456",
    },
    {
      id: "5",
      name: "Returns Export",
      description: "Return processing data with receipt/waiver history and audit trail",
      datasetType: "returns",
      authorizedRoles: ["manager"],
      quarantine: true,
      typeChecksum: "sha256:abc456def7",
    },
    {
      id: "6",
      name: "Fulfilment Export",
      description: "Fulfilment data with outbox/job tracking and dead-letter queue status",
      datasetType: "fulfilment",
      authorizedRoles: ["manager"],
      quarantine: true,
      typeChecksum: "sha256:def7abc123",
    },
    {
      id: "7",
      name: "Service Export",
      description: "Service case data with outbox publisher tracking and retry statistics",
      datasetType: "service",
      authorizedRoles: ["manager"],
      quarantine: true,
      typeChecksum: "sha256:7abc123def",
    },
    {
      id: "8",
      name: "Analytics Export",
      description: "Usage and metrics data with performance budgets and capacity envelopes",
      datasetType: "analytics",
      authorizedRoles: ["admin"],
      quarantine: true,
      typeChecksum: "sha256:abc123def7",
    },
  ];

  res.json(datasets);
}

// Generate export dataset
export function generateExport(req: AuthedRequest, res: Response) {
  const { datasetId } = req.body;
  const userRole = req.staff?.role || "staff";

  // Validate export access per REQ-025 (Evidence and privacy)
  const access = validateExportAccess(
    userRole,
    {
      id: datasetId,
      name: "",
      description: "",
      datasetType: datasetId as ExportDatasetType,
      authorizedRoles: [],
      quarantine: true,
      typeChecksum: "",
    } as ExportDefinition,
    "csv",
  );

  if (!access.authorized) {
    res.status(403).json({ error: access.reason || "Access denied" });
    return;
  }

  // Placeholder: In production, this would call storage.generateExport()
  // which would: query PostgreSQL for dataset with filters, encode as CSV with safe encoding,
  // upload to private S3-compatible storage with virus scanning, generate SBOM, return signed URL
  const jobId = randomUUID();

  res.status(202).json({
    jobId,
    datasetId,
    status: "pending",
    signedUrl: `#storage-signed-url-${jobId}`,
    expiresAt: new Date(Date.now() + 300 * 1000), // 5 minutes
    estimatedRowCount: 0,
    checksum: "",
  });
}

// Download export file with signed URL and virus scan status
export function downloadExport(req: Request, res: Response) {
  const { fileId } = req.params;

  // Placeholder: In production, this would call storage.download()
  // which would return a signed URL that expires after TTL, with virus scan status

  res.set("Content-Type", "text/csv");
  res.set("Content-Disposition", `attachment; filename="export-${fileId}.csv"`);
  res.send(`CSV data for export ${fileId}; row count placeholder; checksum placeholder`);
}

// Validate export access before generation
export function validateExportAccessWrap(userRole: string, datasetId: string) {
  // Fail-closed: an empty authorizedRoles list denies every role until real grants exist.
  return validateExportAccess(
    userRole as StaffRole,
    {
      id: datasetId,
      name: "",
      description: "",
      datasetType: datasetId as ExportDatasetType,
      authorizedRoles: [],
      quarantine: true,
      typeChecksum: "",
    },
    "csv",
  );
}
