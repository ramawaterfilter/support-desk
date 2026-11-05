import { Request, Response } from "express";

// Staff login
// Sign-in is not implemented yet: confirmed policy D-03 requires Google Workspace OIDC
// with no local passwords (milestone M07, provider setup blocked on authorization).
export function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (email && password) {
    res.status(501).json({
      error: "Staff sign-in is not configured. Google Workspace OIDC integration is pending (M07).",
      code: "AUTH_NOT_CONFIGURED",
    });
  } else {
    res.status(400).json({ error: "Email and password required" });
  }
}

// Staff invite
export function invite(req: Request, res: Response) {
  const { email, role } = req.body;
  // Placeholder: In production, this would invite a staff member via the identity provider
  if (email && role) {
    res.status(201).json({ message: "Invitation sent", email, role });
  } else {
    res.status(400).json({ error: "Email and role required" });
  }
}

// Staff recovery (password reset)
export function recovery(req: Request, res: Response) {
  const { email } = req.body;
  // Placeholder: In production, this would initiate password recovery via the identity provider
  if (email) {
    res.json({ message: "Recovery initiated", email });
  } else {
    res.status(400).json({ error: "Email required" });
  }
}
