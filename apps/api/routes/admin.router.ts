import { Router, Request, Response, NextFunction } from "express";
import {
  managerOverride,
  policyUpdate,
  exportGrant,
  getTicketRevision,
  bulkUpdateTickets,
  listExportsWithFilters,
} from "../controllers/admin.controller";

const router = Router();

// POST /api/admin/override - Manager override for decisions
router.post("/override", managerOverride);

// POST /api/admin/policy - Policy update
router.post("/policy", policyUpdate);

// POST /api/admin/export-grant - Export dataset access grant
router.post("/export-grant", exportGrant);

// GET /api/admin/ticket/:ticketId/revision - Ticket revision inquiry
router.get("/ticket/:ticketId/revision", getTicketRevision);

// POST /api/admin/tickets/bulk-update - Bulk ticket operations
router.post("/tickets/bulk-update", bulkUpdateTickets);

// GET /api/admin/exports/filters - Export dataset listing with filters
router.get("/exports/filters", listExportsWithFilters);

// Error handling middleware for this router
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, message } = (err ?? {}) as { statusCode?: number; message?: string };
  res.status(statusCode || 500).json({ error: message });
});

export { router as adminRouter };
