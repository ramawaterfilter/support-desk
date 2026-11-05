import type { Request } from "express";
import type { StaffRole } from "../../packages/shared";

// Express request carrying staff identity once the auth middleware attaches it.
// Optional until OIDC lands (M07); handlers fall back to placeholder identities.
export type AuthedRequest = Request & {
  staff?: { staffId?: string; role?: StaffRole };
};
