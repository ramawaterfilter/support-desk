import React, { useState } from "react";
import "./TicketForm.css";

export interface TicketFormProps {
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (title: string, description: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function TicketForm({
  initialTitle,
  initialDescription,
  onSubmit,
  isLoading,
}: TicketFormProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(title, description);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Submit failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Create Ticket</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value as string)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value as string)}
            rows={3}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            disabled={isLoading}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-supportDesk-accent text-white py-2 rounded hover:bg-supportDesk-accent/90 disabled:opacity-50"
          disabled={isLoading || submitting}
        >
          {isLoading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
