/// <reference types="node" />
import { Id } from "../../packages/shared";

// Job queue configuration
// Initial: bullmq with Redis, migrate to SQS/AWS later
// Worker concurrency limits
// Idempotent processing with dedup
// Dead-letter queue for failed jobs

export const JobQueueConfig = {
  // Queue names
  queues: {
    tickets: "tickets",
    exports: "exports",
    emails: "emails",
    admin: "admin",
  },
  // Worker concurrency per queue
  concurrency: {
    tickets: 10,
    exports: 5,
    emails: 3,
    admin: 2,
  },
  // Dead-letter queue name
  deadLetter: "dead-letter",
  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMs: 1000, // initial backoff
    maxBackoffMs: 30000,
    jitter: true,
  },
  // Scheduler configuration
  scheduler: {
    // Durable scheduler driving worker
    // Runs at defined intervals, processes outbox items
    intervalMs: 5000, // check every 5 seconds
    // Batch size for processing
    batchSize: 50,
    // Idempotency window (ms) — events within this window are deduped
    idempotencyWindowMs: 60000,
  },
};

// Job types
export type JobType =
  "process-ticket" | "process-export" | "send-email" | "admin-action" | "cleanup";

// Job payload types
export interface ProcessTicketJob {
  type: "process-ticket";
  ticketId: Id;
  action: "create" | "update-status" | "add-comment" | "resolve";
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export interface ProcessExportJob {
  type: "process-export";
  exportId: string;
  action: "generate" | "validate" | "finalize";
  payload?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface SendEmailJob {
  type: "send-email";
  recipient: string;
  template: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export interface AdminActionJob {
  type: "admin-action";
  action: "manager-override" | "policy-update" | "system-config";
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

// Dead-letter entry
export interface DeadLetterEntry {
  jobType: JobType;
  payload: Record<string, unknown>;
  error: string;
  attempts: number;
  failedAt: Date;
  idempotencyKey: string;
  resolved?: false;
  resolution?: {
    status: "requeued" | "handled" | "discarded";
    resolvedAt: Date;
    notes: string;
  };
}

// Outbox record for durable scheduling
export interface OutboxRecord {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  attempts: number;
}

// Worker process function
export async function processJob(
  _jobType: JobType,
  _payload: Record<string, unknown>,
  _idempotencyKey: string,
): Promise<{ success: boolean; processedAt: Date; error?: string }> {
  // Placeholder: In production, this would:
  // 1. Check idempotency — if already processed with same key, return cached result
  // 2. Dispatch to appropriate handler based on jobType
  // 3. On failure, send to dead-letter queue after maxAttempts
  // 4. On success, mark as processed in outbox

  // Simulate job processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    success: true,
    processedAt: new Date(),
    error: undefined,
  };
}

// Outbox publisher — publishes jobs to the queue from database outbox
export async function publishFromOutbox(_outboxItem: OutboxRecord): Promise<boolean> {
  // Placeholder: In production, this would:
  // 1. Check idempotency window
  // 2. Publish to job queue (bullmq, SQS, etc.)
  // 3. Mark outbox item as published
  // 4. Return true if successfully published
  return true;
}
