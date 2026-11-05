import { useState } from "react";

export interface StaffUser {
  staffId: string;
  email: string;
  role: "staff" | "manager" | "admin";
}

export interface Auth {
  user: StaffUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  enterPreview: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): Auth {
  const [user, setUser] = useState<StaffUser | null>(null);

  // Real sign-in path: the API returns 501 until the Google Workspace OIDC
  // integration (M07) is configured. No local password success is simulated.
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser({ staffId: data.staffId, email, role: data.roles?.[0] ?? "staff" });
        return { ok: true };
      }
      const data = await response.json().catch(() => ({}));
      return { ok: false, error: data.error ?? `Sign-in failed (${response.status})` };
    } catch (error) {
      return { ok: false, error: `API unreachable: ${String(error)}` };
    }
  };

  // Explicit unauthenticated local preview over synthetic data — not a login.
  const enterPreview = () => {
    setUser({ staffId: "LOCAL-PREVIEW", email: "preview@localhost", role: "staff" });
  };

  const logout = () => setUser(null);

  return { user, login, enterPreview, logout, isAuthenticated: user !== null };
}
