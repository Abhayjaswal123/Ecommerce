import { Router } from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controller/order.controller.js";
import {
  verifyUser,
  verifyUserRole,
  verifyVendor,
} from "../middleware/auth.request.js";

const router = Router();

router.post("/", verifyUser, verifyUserRole, createOrder);
router.get("/", verifyUser, getOrders);
router.patch("/:orderId/status", verifyUser, verifyVendor, updateOrderStatus);

export default router;
