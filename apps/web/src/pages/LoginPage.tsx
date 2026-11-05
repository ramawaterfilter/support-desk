import React, { useState } from "react";
import type { Auth } from "../hooks/useAuth";

export function LoginPage({ auth }: { auth: Auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await auth.login(email, password);
      if (!result.ok) setError(result.error ?? "Sign-in unavailable");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-center">Staff Sign-In</h2>
        <p className="text-center text-xs text-gray-500 mb-6">
          Google Workspace OIDC — not yet configured (M07)
        </p>
        {submitting ? (
          <p className="text-center text-sm text-gray-500">Signing in...</p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                aria-describedby="email-help"
              />
              <p className="text-xs text-gray-500" id="email-help">
                Enter your staff email address
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                aria-describedby="password-help"
              />
              <p className="text-xs text-gray-500" id="password-help">
                Local passwords are disabled; OIDC only
              </p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-supportDesk-accent">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-supportDesk-accent text-white py-2 rounded hover:bg-supportDesk-accent/90"
            >
              Sign In
            </button>
          </form>
        )}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={auth.enterPreview}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
          >
            Enter local preview (no authentication, synthetic data)
          </button>
        </div>
      </div>
    </div>
  );
}
