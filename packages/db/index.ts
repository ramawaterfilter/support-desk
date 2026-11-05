/// <reference types="node" />
import { Id, TicketStatus, ExportDatasetType, StaffRole, Timestamp } from "../shared";

// Database connection configuration
// Uses connection pooling (pgbouncer or pg Pool)
// Migration tooling: knex or sequelize with lockfiles
// Schema changes via bounded batches (never lock table for extended periods)

// Database driver placeholder — will use pg (node-postgres) or knex in production
export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "support_desk",
  user: process.env.DB_USER || "support_desk_user",
  password: process.env.DB_PASSWORD || "",
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
  },
  // Migration commands (run via knex migrate:latest / knex rollback)
  migrationDirectory: "db/migrations",
  // Bounded batch size for schema changes
  batchSize: Number(process.env.DB_BATCH_SIZE) || 1000,
};

// Base query builder using pg (node-postgres) pattern
export interface PgQueryResult<T> {
  rows: T[];
  rowCount: number;
  command: string;
}

// Staff table operations
export interface StaffRecord {
  id: Id;
  email: string;
  role: StaffRole;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  isActive: boolean;
}

// Ticket table operations
export interface TicketRecord {
  id: Id;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "critical";
  assigneeId?: Id;
  creatorId: Id;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  revision: number; // for revisioned service decisions (REQ-006)
}

// Export dataset record
export interface ExportRecord {
  id: string;
  datasetType: ExportDatasetType;
  creatorId: Id;
  createdAt: Timestamp;
  filterConfig?: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  quarantine: boolean;
}

// Database query builders

// Staff queries
export const staffQueries = {
  findById: (_staffId: Id) => `SELECT * FROM staff WHERE id = $1 AND is_active = true`,
  findByEmail: (_email: string) => `SELECT * FROM staff WHERE email = $1 AND is_active = true`,
  activate: (_staffId: Id) => `UPDATE staff SET is_active = true WHERE id = $1`,
  deactivate: (_staffId: Id) => `UPDATE staff SET is_active = false WHERE id = $1`,
};

// Ticket queries
export const ticketQueries = {
  findById: (_ticketId: Id) => `SELECT * FROM tickets WHERE id = $1`,
  findOpenTickets: () => `SELECT * FROM tickets WHERE status = 'open'`,
  findByAssignee: (_assigneeId: Id) =>
    `SELECT * FROM tickets WHERE assignee_id = $1 AND status != 'closed'`,
  create: (_ticket: Omit<TicketRecord, "id" | "createdAt" | "updatedAt" | "revision">) =>
    `INSERT INTO tickets (title, description, status, priority, assignee_id, creator_id, created_at, updated_at, revision) VALUES ($1, $2, 'open', 'medium', NULL, $3, NOW(), NOW(), 1) RETURNING *`,
  updateStatus: (_ticketId: Id, _status: TicketStatus) =>
    `UPDATE tickets SET status = $1, updated_at = NOW(), revision = revision + 1 WHERE id = $2 AND (status != $1 OR COALESCE(status, '') != $1) RETURNING *`,
  incrementRevision: (_ticketId: Id) =>
    `UPDATE tickets SET revision = revision + 1 WHERE id = $1 RETURNING revision`,
};

// Export queries
export const exportQueries = {
  findById: (_exportId: string) => `SELECT * FROM exports WHERE id = $1`,
  create: (_exportDef: Omit<ExportRecord, "id" | "createdAt">) =>
    `INSERT INTO exports (dataset_type, creator_id, created_at, filter_config, status, quarantine) VALUES ($1, $2, NOW(), $3, 'pending', $4) RETURNING *`,
  updateStatus: (_exportId: string, _status: ExportRecord["status"]) =>
    `UPDATE exports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
};
