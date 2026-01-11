import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const limit = z.coerce.number().int().min(1).max(500).catch(200).parse(req.query.limit);

  const history = await prisma.historyLog.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  res.json({ history });
});

export default router;

