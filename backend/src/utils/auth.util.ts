import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in the environment.");
}

export const generateAuthToken = (
    userId: string,
    role: string
): string =>
    jwt.sign(
        { id: userId, role },
        JWT_SECRET,
        { expiresIn: "1d" }
    );