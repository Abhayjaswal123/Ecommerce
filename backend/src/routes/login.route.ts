import { Router } from "express";
import { register, login, logout, checkAuth } from "../controller/auth.controller.js";
import { validate } from "../middleware/auth.validator.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post("/logout", logout);
router.get("/me", checkAuth);

export default router;