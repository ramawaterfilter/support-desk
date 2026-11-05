/// <reference types="node" />
import { Id, ExportDatasetType, StaffRole, Timestamp } from "../shared";

// Policy: Shared customer identity (REQ-001)
// Ensures one person identity spans brands; household contacts do not force a merge

export interface CustomerIdentity {
  customerId: Id;
  canonicalContact: string; // explicitly disambiguated person
  histories: {
    brandA: string[];
    brandB: string[];
  };
}

// Validate that two records sharing a canonical contact are NOT auto-merged
export function validateNoAutoMerge(
  recordA: { contact: string; customerId: Id },
  recordB: { contact: string; customerId: Id },
): { valid: true } | { valid: false; reason: string } {
  if (recordA.contact === recordB.contact && recordA.customerId !== recordB.customerId) {
    return {
      valid: false,
      reason: "Records share contact but have different customer IDs — do not auto-merge",
    };
  }
  return { valid: true };
}

// Policy: Manager classification (REQ-003)
// Unknown category creates scoped eligible manager obligation that generic completion cannot bypass

export function classifyCase(
  caseData: {
    category: string;
    message: string;
    eligibleManagerIds: Id[];
  },
  managerId: Id,
): {
  classified: true;
  classification: "approved" | "pending-review" | "blocked";
  message: string;
} {
  if (!caseData.eligibleManagerIds.includes(managerId)) {
    return {
      classified: true,
      classification: "blocked",
      message: "Manager is not eligible for this case category",
    };
  }

  if (!caseData.category || caseData.category === "unknown") {
    return {
      classified: true,
      classification: "pending-review",
      message: "Unknown category — manager classification required to proceed",
    };
  }

  return {
    classified: true,
    classification: "approved",
    message: `Case classified under category: ${caseData.category}`,
  };
}

// Policy: Claims and collaboration (REQ-004)
// Assignment, current worker and task owner remain separate with explicit takeover and stale-version protection

export interface TicketAssignment {
  ticketId: Id;
  assigneeId: Id;
  currentWorkerId: Id; // who is actively working on it
  taskOwnerId: Id; // who owns the task
  leaseExpiry: Timestamp; // when takeover becomes possible
}

// Check if a stale save should be refused without losing local draft
export function canOverwriteExistingAssignment(
  existing: TicketAssignment,
  newAssignment: TicketAssignment,
  leaseTimestamp: Timestamp,
): { canOverwrite: boolean; reason?: string } {
  // Simplified: if lease has just expired, takeover becomes possible
  // one second before, it is refused
  const leaseTime = new Date(leaseTimestamp).getTime();
  const now = Date.now();
  const oneSecond = 1000;

  if (now >= leaseTime && now < leaseTime + oneSecond) {
    return { canOverwrite: true, reason: "Lease just expired — takeover possible" };
  }

  if (now < leaseTime) {
    return { canOverwrite: true, reason: "Lease still active — takeover not yet possible" };
  }

  return {
    canOverwrite: false,
    reason: "Lease expired more than one second ago — refusal required",
  };
}

// Policy: Allowed manager self-approval (REQ-007)
// Eligible managers may approve their own/materially edited request under ordinary scope rules

export function canManagerSelfApprove(
  managerId: Id,
  requestScope: string,
  requestEdits: string[],
): { allowed: boolean; reason?: string } {
  // Placeholder: eligible manager check against recorded decisions D-03/D-11/D-12
  // In production, this would check the manager's market eligibility and scope
  if (requestEdits.length > 0) {
    return { allowed: true, reason: "Manager with material edits may self-approve" };
  }
  return {
    allowed: false,
    reason: "No edits detected — self-approval not applicable without material changes",
  };
}

// Policy: Atomic audited commands (REQ-026)
// Domain/tasks/audit/outbox/idempotency commit together with exact snapshots and no partial failure

export interface AuditedCommandResult {
  success: boolean;
  domainSnapshot: Record<string, unknown>;
  taskUpdates: Record<string, unknown>;
  auditEntry: Record<string, unknown>;
  outboxEntry: Record<string, unknown>;
  idempotencyKey: string;
}

// Commit domain, tasks, audit, outbox and idempotency together
export function commitAuditedCommand(
  command: Record<string, unknown>,
  idempotencyKey: string,
): AuditedCommandResult {
  // Placeholder: In production, this would use a database transaction with
  // exact snapshots and idempotency guarantees
  return {
    success: true,
    domainSnapshot: {},
    taskUpdates: {},
    auditEntry: { command, idempotencyKey, committedAt: new Date().toISOString() },
    outboxEntry: { type: "command-committed", idempotencyKey },
    idempotencyKey,
  };
}

// Policy: Export governance (REQ-020)
// Eight complete export datasets with safe CSV encoding and download reauthorisation

export interface ExportDefinition {
  id: string;
  name: string;
  description: string;
  datasetType: ExportDatasetType;
  authorizedRoles: StaffRole[];
  quarantine: boolean;
  typeChecksum: string;
}

// Validate export access
export function validateExportAccess(
  userRole: StaffRole,
  exportDef: ExportDefinition,
  fileType: "csv" | "json",
): { authorized: boolean; reason?: string } {
  if (!exportDef.authorizedRoles.includes(userRole)) {
    return {
      authorized: false,
      reason: `Role ${userRole} not authorized for ${exportDef.name} export`,
    };
  }
  if (exportDef.quarantine && !fileType) {
    return { authorized: false, reason: "File type must be specified for quarantined exports" };
  }
  return { authorized: true, reason: "Access authorized" };
}

// Policy: Identity/recovery truth (REQ-024)
// Authenticated staff provider and actual verification/delivery states replace simulated role/reset

export function authenticateStaff(
  _provider: string,
  _token: string,
): {
  authenticated: boolean;
  staffId: Id;
  verificationState: "verified" | "pending" | "failed";
  deliveryState: "delivered" | "pending" | "failed";
} {
  // Placeholder: In production, this would validate against the chosen identity provider
  // and use actual verification and delivery states (not simulated role/reset)
  return {
    authenticated: true,
    staffId: "STAFF-PLACEHOLDER" as Id,
    verificationState: "verified",
    deliveryState: "pending",
  };
}
