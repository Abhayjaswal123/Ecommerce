import { Router } from "express";
import { verifyUser, verifyUserRole } from "../middleware/auth.request.js";
import {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem,
} from "../controller/cart.controller.js";

const router = Router();

router.get("/", verifyUser, verifyUserRole, getCart);
router.post("/:productId", verifyUser, verifyUserRole, addToCart);
router.patch("/:productId", verifyUser, verifyUserRole, updateCartItem);

router.delete("/:productId", verifyUser, verifyUserRole, removeFromCart);

export default router;