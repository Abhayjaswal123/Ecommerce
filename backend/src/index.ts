
import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "E-commerce backend server is running!"
  });
});

export default router;