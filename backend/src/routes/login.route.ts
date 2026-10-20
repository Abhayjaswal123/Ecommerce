import { Router } from "express";
import { register, login, logout, getMe } from "../controller/auth.controller.js";
import { verifyUser } from "../middleware/auth.request.js";
const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);
router.get("/me", verifyUser, getMe);

export default router;