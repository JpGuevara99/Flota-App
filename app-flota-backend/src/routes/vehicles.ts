import { Router } from "express";
import { z } from "zod";
import type { HistoryLog } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { zDate } from "../lib/zod.js";

const router = Router();

const vehicleCreateSchema = z.object({
  type: z.string().min(1),
  project: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  model: z.string().min(1),
  brand: z.string().min(1),
  licensePlate: z.string().min(1),
});

const vehicleUpdateSchema = vehicleCreateSchema.partial();

const documentCreateSchema = z.object({
  type: z.enum([
    "permiso_circulacion",
    "revision_tecnica",
    "emision_contaminantes",
    "soap",
    "mantencion_general",
    "miscelaneo",
  ]),
  name: z.string().min(1),
  expirationDate: zDate,
  issueDate: zDate,
  renewalFrequency: z.string().min(1),
  fileName: z.string().min(1).optional(),
  fileUrl: z.string().min(1).optional(),
  observations: z.string().min(1).optional(),
});

const documentUpdateSchema = documentCreateSchema
  .omit({ type: true, renewalFrequency: true })
  .partial()
  .extend({
    // allow updating anything relevant in renew/update flows
    type: documentCreateSchema.shape.type.optional(),
    renewalFrequency: documentCreateSchema.shape.renewalFrequency.optional(),
  });

const vehicleDisplayName = (v: { brand: string; model: string; licensePlate: string }) =>
  `${v.brand} ${v.model} (${v.licensePlate})`;

const hasErrorCode = (e: unknown): e is { code: string } =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  typeof (e as { code?: unknown }).code === "string";

router.get("/", async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "asc" },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });
  res.json({ vehicles });
});

router.post("/", async (req, res) => {
  const parsed = vehicleCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  try {
    const vehicle = await prisma.vehicle.create({
      data: parsed.data,
      include: { documents: true },
    });

    const historyLog = await prisma.historyLog.create({
      data: {
        vehicleId: vehicle.id,
        vehicleName: vehicleDisplayName(vehicle),
        action: "vehicle_created",
        details: "Nuevo vehículo agregado al sistema",
        user: "Admin",
      },
    });

    return res.status(201).json({ vehicle, historyLogs: [historyLog] });
  } catch (e: unknown) {
    if (hasErrorCode(e) && e.code === "P2002") {
      return res.status(409).json({ error: "license_plate_already_exists" });
    }
    throw e;
  }
});

router.patch("/:id", async (req, res) => {
  const parsed = vehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  const id = req.params.id;
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "vehicle_not_found" });

  try {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: parsed.data,
      include: { documents: true },
    });

    type UpdatableKey = keyof z.infer<typeof vehicleCreateSchema>;
    const logs: HistoryLog[] = [];
    const keys = Object.keys(parsed.data) as UpdatableKey[];
    for (const key of keys) {
      const oldVal = existing[key];
      const newVal = updated[key];
      if (oldVal !== undefined && newVal !== undefined && String(oldVal) !== String(newVal)) {
        logs.push(
          await prisma.historyLog.create({
            data: {
              vehicleId: updated.id,
              vehicleName: vehicleDisplayName(updated),
              action: "vehicle_updated",
              field: String(key),
              oldValue: String(oldVal),
              newValue: String(newVal),
              details: `Campo "${String(key)}" actualizado`,
              user: "Admin",
            },
          })
        );
      }
    }

    return res.json({ vehicle: updated, historyLogs: logs });
  } catch (e: unknown) {
    if (hasErrorCode(e) && e.code === "P2002") {
      return res.status(409).json({ error: "license_plate_already_exists" });
    }
    throw e;
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return res.status(404).json({ error: "vehicle_not_found" });

  const historyLog = await prisma.historyLog.create({
    data: {
      vehicleId: id,
      vehicleName: vehicleDisplayName(vehicle),
      action: "vehicle_deleted",
      details: "Vehículo eliminado del sistema",
      user: "Admin",
    },
  });

  await prisma.vehicle.delete({ where: { id } });
  return res.json({ ok: true, historyLogs: [historyLog] });
});

router.post("/:vehicleId/documents", async (req, res) => {
  const parsed = documentCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  const vehicleId = req.params.vehicleId;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return res.status(404).json({ error: "vehicle_not_found" });

  const document = await prisma.document.create({
    data: { ...parsed.data, vehicleId },
  });

  const historyLog = await prisma.historyLog.create({
    data: {
      vehicleId,
      vehicleName: vehicleDisplayName(vehicle),
      action: "document_added",
      field: parsed.data.name,
      details: `Documento "${parsed.data.name}" agregado`,
      user: "Admin",
    },
  });

  const updatedVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });

  return res.status(201).json({ vehicle: updatedVehicle, document, historyLogs: [historyLog] });
});

router.patch("/:vehicleId/documents/:documentId", async (req, res) => {
  const parsed = documentUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  const { vehicleId, documentId } = req.params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return res.status(404).json({ error: "vehicle_not_found" });

  const existingDoc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!existingDoc || existingDoc.vehicleId !== vehicleId) return res.status(404).json({ error: "document_not_found" });

  const updatedDoc = await prisma.document.update({
    where: { id: documentId },
    data: { ...parsed.data, lastRenewalDate: new Date() },
  });

  const oldExp = existingDoc.expirationDate.toISOString().split("T")[0];
  const newExp = updatedDoc.expirationDate.toISOString().split("T")[0];
  const action = oldExp !== newExp ? "document_renewed" : "document_updated";

  const historyLog = await prisma.historyLog.create({
    data: {
      vehicleId,
      vehicleName: vehicleDisplayName(vehicle),
      action,
      field: updatedDoc.name,
      oldValue: oldExp !== newExp ? oldExp : undefined,
      newValue: oldExp !== newExp ? newExp : undefined,
      details:
        oldExp !== newExp
          ? `Documento renovado - Nueva fecha de expiración: ${newExp}`
          : `Documento "${updatedDoc.name}" actualizado`,
      user: "Admin",
    },
  });

  const updatedVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });

  return res.json({ vehicle: updatedVehicle, document: updatedDoc, historyLogs: [historyLog] });
});

router.delete("/:vehicleId/documents/:documentId", async (req, res) => {
  const { vehicleId, documentId } = req.params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return res.status(404).json({ error: "vehicle_not_found" });

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.vehicleId !== vehicleId) return res.status(404).json({ error: "document_not_found" });

  const historyLog = await prisma.historyLog.create({
    data: {
      vehicleId,
      vehicleName: vehicleDisplayName(vehicle),
      action: "document_deleted",
      field: doc.name,
      details: `Documento "${doc.name}" eliminado`,
      user: "Admin",
    },
  });

  await prisma.document.delete({ where: { id: documentId } });

  const updatedVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });

  return res.json({ vehicle: updatedVehicle, historyLogs: [historyLog] });
});

export default router;

