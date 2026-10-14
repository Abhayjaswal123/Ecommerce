import { Router } from "express";
import { createProduct, getProducts, updateProduct,deleteProduct } from "../controller/product.controller.js";
import { verifyUser, verifyUserRole, verifyVendor } from "../middleware/auth.request.js";

const router = Router();

router.get("/",verifyUser,verifyUserRole, getProducts);
router.post("/create",verifyUser,verifyVendor, createProduct);
router.post("/update/:id",verifyUser,verifyVendor, updateProduct);
router.post("/delete/:id",verifyUser,verifyVendor, deleteProduct);

export default router;