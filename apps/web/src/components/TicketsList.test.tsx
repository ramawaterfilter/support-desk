/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TicketsList } from "./TicketsList";

afterEach(cleanup);

describe("TicketsList", () => {
  it("renders a ticket's id, status and priority", () => {
    render(
      <TicketsList
        tickets={[
          {
            id: "TICKET-001",
            title: "RO membrane replacement question",
            status: "open",
            priority: "medium",
          },
        ]}
      />,
    );
    expect(screen.getByText("RO membrane replacement question")).toBeTruthy();
    expect(screen.getByText(/TICKET-001/)).toBeTruthy();
    expect(screen.getByText(/Status: open/)).toBeTruthy();
    expect(screen.getByText(/Priority: medium/)).toBeTruthy();
  });

  it("renders the empty state when there are no tickets", () => {
    render(<TicketsList tickets={[]} />);
    expect(screen.getByText(/No tickets found/)).toBeTruthy();
  });
});
