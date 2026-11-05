import React from "react";

export function TicketsList({
  tickets = [],
}: {
  tickets?: Array<{ id: string; title: string; status: string; priority: string }>;
}) {
  return (
    <div className="bg-white p-6 rounded border border-gray-200">
      {tickets.length === 0 ? (
        <p className="text-sm text-gray-500">
          No tickets found. Create a new ticket to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-3 bg-supportDesk-lighterBlue text-white rounded">
              <h4 className="font-medium">{ticket.title}</h4>
              <p className="text-sm text-gray-300">
                {ticket.id} • Status: {ticket.status} • Priority: {ticket.priority}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
