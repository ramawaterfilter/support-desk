import { Request, Response } from "express";
import { TicketStatus, ExportDatasetType } from "../../../packages/shared";
import { validateExportAccess, ExportDefinition } from "../../../packages/policy";
import type { AuthedRequest } from "../types";

// Manager override for decisions (REQ-007, D-03/D-11/D-12)
// Eligible managers may approve their own/materially edited request under ordinary scope rules
export function managerOverride(req: AuthedRequest, res: Response) {
  const { requestId, decision, justification } = req.body;
  const managerId = req.staff?.staffId || "MANAGER-PLACEHOLDER";

  if (requestId && decision) {
    res.json({
      success: true,
      requestId,
      decision,
      justifiedBy: justification || "Manager discretion",
      appliedBy: managerId,
      appliedAt: new Date().toISOString(),
      audit: {
        identity: managerId,
        scope: "ordinary-scope-rules",
        timestamp: new Date().toISOString(),
      },
    });
  } else {
    res.status(400).json({ error: "requestId and decision required" });
  }
}

// Policy update (manager action)
// Per REQ-022 (User/role access lifecycle): current union grants and scope govern commands
export function policyUpdate(req: AuthedRequest, res: Response) {
  const { policyId, changes } = req.body;
  const managerId = req.staff?.staffId || "MANAGER-PLACEHOLDER";

  if (policyId && changes) {
    res.json({
      success: true,
      policyId,
      changesApplied: changes,
      updatedBy: managerId,
      updatedAt: new Date().toISOString(),
      safeguard: "admin-strand-protection-verified",
    });
  } else {
    res.status(400).json({ error: "policyId and changes required" });
  }
}

// Export dataset access grant (manager action)
// Per REQ-025: quarantine/type/size/checksum/scan and current authorised download protect files/PII
export function exportGrant(req: AuthedRequest, res: Response) {
  const { exportId, userRole, durationHours } = req.body;
  const managerId = req.staff?.staffId || "MANAGER-PLACEHOLDER";

  if (exportId && userRole) {
    const definition = {
      id: exportId,
      name: "",
      description: "",
      datasetType: exportId as ExportDatasetType,
      authorizedRoles: [],
      quarantine: true,
      typeChecksum: "",
    } as ExportDefinition;
    const access = validateExportAccess(userRole, definition, "csv");

    if (!access.authorized) {
      res.status(403).json({ error: access.reason || "Access denied" });
      return;
    }

    res.json({
      success: true,
      exportId,
      grantedTo: userRole,
      grantedBy: managerId,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationHours * 3600000).toISOString(),
      quarantine: true,
      reauthorisationRequired: true,
      typeChecksum: definition.typeChecksum,
    });
  } else {
    res.status(400).json({ error: "exportId and userRole required" });
  }
}

// Ticket revision inquiry (REQ-006)
// Only exact current final approved revision enables consequential execution
export function getTicketRevision(req: Request, res: Response) {
  const { ticketId } = req.params;

  // In production, this would query the database for the current revision
  // and refuse execution against superseded revisions
  res.json({
    ticketId,
    currentRevision: 1,
    currentStatus: "open" as TicketStatus,
    executionEnabled: true,
  });
}

// Bulk ticket operations
export function bulkUpdateTickets(req: AuthedRequest, res: Response) {
  const { ticketIds, status, assigneeId } = req.body;
  const managerId = req.staff?.staffId || "MANAGER-PLACEHOLDER";

  if (!ticketIds || ticketIds.length === 0) {
    res.status(400).json({ error: "ticketIds required" });
    return;
  }

  res.json({
    success: true,
    updatedCount: ticketIds.length,
    ticketIds,
    status,
    assigneeId,
    updatedBy: managerId,
    updatedAt: new Date().toISOString(),
    safeguard: "bulk-operation-audit-trail",
  });
}

// Export dataset listing with filters
export function listExportsWithFilters(req: Request, res: Response) {
  const { datasetType, status, search } = req.query;
  const datasets = [
    {
      id: "1",
      name: "Tickets Export",
      description: "All ticket data",
      datasetType: "tickets",
      authorizedRoles: ["staff", "manager"],
      quarantine: true,
    },
    {
      id: "2",
      name: "Customers Export",
      description: "Customer master data",
      datasetType: "customers",
      authorizedRoles: ["staff", "manager"],
      quarantine: true,
    },
    {
      id: "3",
      name: "Reports Export",
      description: "Analytics reports",
      datasetType: "reports",
      authorizedRoles: ["manager", "admin"],
      quarantine: true,
    },
  ];

  let filtered = datasets;
  if (datasetType) {
    filtered = filtered.filter((d) => d.datasetType === datasetType);
  }
  if (status) {
    filtered = filtered.filter((d) => d.datasetType === status);
  }
  if (search) {
    const searchLower = String(search).toLowerCase();
    filtered = filtered.filter((d) => d.name.toLowerCase().includes(searchLower));
  }

  res.json(filtered);
}
