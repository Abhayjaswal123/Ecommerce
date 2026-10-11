import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import indexRoutes from "./index.js";
import authRoutes from "./routes/login.route.js"
import cors from "cors";
const app = express();
const PORT = 5000;

// calling db
connectDb();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);



// Register routes
app.use("/", indexRoutes);
app.use("/api", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;