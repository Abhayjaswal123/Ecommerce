import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import userModal from "../model/user.model.js";
import { generateAuthToken } from "../utils/auth.util.js";

// const cookieSecure = process.env.NODE_ENV === "production";

export const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const role = req.body.role === "vendor" ? "vendor" : "user";

    if (
        typeof email !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !username.trim() ||
        password.length < 8
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid email, username, and password of at least 8 characters are required."
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExisted = await userModal.findOne({ email: normalizedEmail });
    if (userExisted) {
        return res.status(400).json({
            success: false,
            message: "User already exist"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModal.create({
        username: username.trim(),
        email: normalizedEmail,
        password: hashPassword,
        role
    })

    const token = generateAuthToken(user._id.toString(), role);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Registration Successful",
        user: {
            username: user.username,
            email: user.email,
            role: user.role
        }
    })

}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password is required."
        });
    }
    const userExisted = await userModal.findOne({ email: email.trim().toLowerCase() });

    if (!userExisted) {
        return res.status(400).json({
            success: false,
            message: "Email not exist"
        })
    }
    const isPassword = await bcrypt.compare(
        password,
        userExisted.password
    );

    if (!isPassword) {
        return res.status(400).json({
            success: false,
            message: "Incorrect Password"
        })
    }

    const token = generateAuthToken(userExisted._id.toString(), userExisted.role);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Login Successful",
        user: {
            username: userExisted.username,
            email: userExisted.email,
            role: userExisted.role
        }
    })

}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        message: "Logout Successful",
    });
}

export const getMe = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Please login first",
            });
            return;
        }

        const user = await userModal.findById(userId).select("-password");

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};