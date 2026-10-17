import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getVendorProducts,
  updateProduct,
} from "../controller/product.controller.js";
import { verifyUser, verifyUserRole, verifyVendor } from "../middleware/auth.request.js";

const router = Router();

router.get("/", verifyUser, verifyUserRole, getProducts);
router.get("/vendor", verifyUser, verifyVendor, getVendorProducts);
router.post("/create", verifyUser, verifyVendor, createProduct);
router.post("/update/:id", verifyUser, verifyVendor, updateProduct);
router.post("/delete/:id", verifyUser, verifyVendor, deleteProduct);

export default router;