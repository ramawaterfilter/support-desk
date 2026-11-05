import React, { useEffect, useState } from "react";
import type { Auth } from "../hooks/useAuth";
import { TicketForm } from "../components/TicketForm";
import { TicketsList } from "../components/TicketsList";

interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

export function TicketsPage({ auth }: { auth: Auth }) {
  const [creating, setCreating] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) setTickets(data.items ?? []);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(String(error));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (title: string, description: string) => {
    setCreating(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const created = await response.json();
      setTickets((prev) => [created, ...prev]);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Support Desk — Tickets</h2>
            <p className="text-gray-500">
              {auth.user?.staffId === "LOCAL-PREVIEW"
                ? "Local preview (unauthenticated, synthetic data)"
                : `Signed in as ${auth.user?.role ?? "unknown"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={auth.logout}
            className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <section className="mb-8">
          <TicketForm
            isLoading={creating}
            onSubmit={handleCreate}
            disabled={!auth.isAuthenticated}
          />
        </section>

        <section>
          <h3 className="text-lg font-medium mb-3">Ticket List</h3>
          {loadError && (
            <p role="alert" className="text-supportDesk-accent mb-3">
              Failed to load tickets from API: {loadError}
            </p>
          )}
          <TicketsList tickets={tickets} />
        </section>
      </main>
    </div>
  );
}
