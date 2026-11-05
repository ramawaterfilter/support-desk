import { Request, Response } from "express";
import { TicketStatus, TicketStatusEnum, PaginationResponse } from "../../../packages/shared";
import type { AuthedRequest } from "../types";
import seedTickets from "../seeds/tickets.json";

interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
}

// Synthetic in-memory store: seed fixtures plus tickets created in this process.
// No database is involved and everything resets on restart (local preview only).
const tickets: Ticket[] = seedTickets as Ticket[];

// Create new ticket
export function createTicket(req: AuthedRequest, res: Response) {
  const { title, description } = req.body;
  const creatorId = req.staff?.staffId || "CREATOR-PLACEHOLDER";

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: `TICKET-${String(tickets.length + 1).padStart(3, "0")}`,
    title,
    description,
    status: "open",
    priority: "medium",
    creatorId,
    createdAt: now,
    updatedAt: now,
    revision: 1,
  };
  tickets.push(ticket);

  res.status(201).json(ticket);
}

// List tickets with filters and pagination
export function listTickets(req: Request, res: Response) {
  const { status, priority, search } = req.query;
  const filterStatus = status as string | undefined;
  const filterPriority = priority as string | undefined;
  const filterSearch = search as string | undefined;

  // Placeholder: In production, this would use the pg query builder with bounded batches
  // and proper pagination using cursor-based pagination
  let filtered = [...tickets];
  if (filterStatus && filterStatus !== "all") {
    filtered = filtered.filter((t) => t.status === filterStatus);
  }
  if (filterPriority) {
    filtered = filtered.filter((t) => t.priority === filterPriority);
  }
  if (filterSearch) {
    const searchLower = filterSearch.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)),
    );
  }

  const response: PaginationResponse<Ticket> = {
    items: filtered,
    nextCursor: undefined,
  };

  res.json(response);
}

// Get ticket by ID
export function getTicket(req: Request, res: Response) {
  const ticket = tickets.find((t) => t.id === req.params.ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
}

// Update ticket status with revision tracking
export function updateTicket(req: Request, res: Response) {
  const { status } = req.body;

  const ticket = tickets.find((t) => t.id === req.params.ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (status !== undefined) {
    if (!Object.values(TicketStatusEnum).includes(status as TicketStatus)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    ticket.status = status as TicketStatus;
    ticket.revision += 1;
    ticket.updatedAt = new Date().toISOString();
  }

  res.json({
    id: ticket.id,
    status: ticket.status,
    revision: ticket.revision,
    updatedAt: ticket.updatedAt,
  });
}

// Add comment to ticket
export function addComment(req: AuthedRequest, res: Response) {
  const { ticketId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Comment content required" });
    return;
  }

  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.status(201).json({
    id: "COMMENT-PLACEHOLDER",
    content,
    createdAt: new Date().toISOString(),
    authorId: req.staff?.staffId || "AUTHOR-PLACEHOLDER",
  });
}

// Increment ticket revision (for revisioned service decisions REQ-006)
export function incrementTicketRevision(req: Request, res: Response) {
  const { ticketId } = req.params;

  // Increment revision in database (placeholder)
  const newRevision = 2;

  res.json({
    id: ticketId,
    revision: newRevision,
  });
}
