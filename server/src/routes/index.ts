import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./users.routes";
import businessRoutes from "./business.routes";
import customerRoutes from "./customer.routes";
import invoiceRoutes from "./invoice.routes";
import receiptRoutes from "./receipt.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "SmartLedger API is healthy",
    result: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/businesses", businessRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/receipts", receiptRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
