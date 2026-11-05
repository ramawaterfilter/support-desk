import { Router, Request, Response, NextFunction } from "express";
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  addComment,
  incrementTicketRevision,
} from "../controllers/ticket.controller";

const router = Router();

// POST /api/tickets - Create new ticket
router.post("/", createTicket);

// GET /api/tickets - List tickets with filters
router.get("/", listTickets);

// GET /api/tickets/:ticketId - Get ticket by ID
router.get("/:ticketId", getTicket);

// PATCH /api/tickets/:ticketId - Update ticket status
router.patch("/:ticketId", updateTicket);

// POST /api/tickets/:ticketId/comments - Add comment
router.post("/:ticketId/comments", addComment);

// POST /api/tickets/:ticketId/revision - Increment revision
router.post("/:ticketId/revision", incrementTicketRevision);

// Error handling middleware for this router
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, message } = (err ?? {}) as { statusCode?: number; message?: string };
  res.status(statusCode || 500).json({ error: message });
});

export { router as ticketsRouter };
