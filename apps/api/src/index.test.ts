import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "./index";

let server: Server;
let base: string;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

describe("health endpoints", () => {
  it("GET /health reports liveness", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("ok");
  });

  it("GET /ready reports readiness", async () => {
    const res = await fetch(`${base}/ready`);
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("ready");
  });
});

describe("tickets API over seed fixtures", () => {
  it("GET /api/tickets returns the seeded tickets with varied statuses", async () => {
    const res = await fetch(`${base}/api/tickets`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(8);
    expect(body.items[0].id).toBe("TICKET-001");
    const statuses = new Set(body.items.map((t: { status: string }) => t.status));
    expect(statuses.size).toBeGreaterThan(1);
  });

  it("GET /api/tickets?status=open filters server-side", async () => {
    const res = await fetch(`${base}/api/tickets?status=open`);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) expect(item.status).toBe("open");
  });

  it("GET /api/tickets/:id returns the exact seeded ticket", async () => {
    const res = await fetch(`${base}/api/tickets/TICKET-003`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Leak under sink after filter change");
    expect(body.priority).toBe("critical");
  });

  it("GET unknown ticket id returns 404", async () => {
    const res = await fetch(`${base}/api/tickets/TICKET-NOPE`);
    expect(res.status).toBe(404);
  });

  it("POST /api/tickets creates a ticket that then appears in the list", async () => {
    const create = await fetch(`${base}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Created by API test", description: "roundtrip" }),
    });
    expect(create.status).toBe(201);
    const created = await create.json();
    expect(created.id).toMatch(/^TICKET-\d{3}$/);
    expect(created.status).toBe("open");

    const list = await fetch(`${base}/api/tickets`);
    const body = await list.json();
    expect(body.items.some((t: { id: string }) => t.id === created.id)).toBe(true);
  });

  it("PATCH with an invalid status is rejected with 400", async () => {
    const res = await fetch(`${base}/api/tickets/TICKET-001`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "not-a-status" }),
    });
    expect(res.status).toBe(400);
  });

  it("PATCH a valid status bumps the revision", async () => {
    const res = await fetch(`${base}/api/tickets/TICKET-001`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in-progress" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("in-progress");
    expect(body.revision).toBe(2);
  });

  it("POST comment on a missing ticket returns 404", async () => {
    const res = await fetch(`${base}/api/tickets/TICKET-NOPE/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "hello" }),
    });
    expect(res.status).toBe(404);
  });
});
