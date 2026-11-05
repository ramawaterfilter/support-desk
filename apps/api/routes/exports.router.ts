import { Router, Response } from "express";
import {
  listExports,
  generateExport,
  downloadExport,
  validateExportAccessWrap,
} from "../controllers/export.controller";
import type { AuthedRequest } from "../types";

const router = Router();

// GET /api/exports - List available export datasets
router.get("/", listExports);

// POST /api/exports - Generate export dataset
router.post("/", generateExport);

// GET /api/exports/:fileId/download - Download export file
router.get("/:fileId/download", downloadExport);

// Validation middleware for export access
router.use((req: AuthedRequest, res: Response, next) => {
  const userRole = req.staff?.role;
  if (!userRole) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  // Validate export access before proceeding
  const datasetId = req.body?.datasetId;
  if (datasetId) {
    const access = validateExportAccessWrap(userRole, datasetId);
    if (!access.authorized) {
      res.status(403).json({ error: access.reason || "Access denied" });
      return;
    }
  }
  next();
});

export { router as exportsRouter };
