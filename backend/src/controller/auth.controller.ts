import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import userModal from "../model/user.model.js";
import { generateAuthToken, verifyAuthToken } from "../utils/auth.util.js";

export const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({
            success: false,
            message: "Email, username, and password are required."
        });
    }

    const userExisted = await userModal.findOne({ email });
    if (userExisted) {
        return res.status(400).json({
            success: false,
            message: "User already exist"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModal.create({
        username,
        email,
        password: hashPassword
    })

    const token = generateAuthToken(user._id.toString());

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Registration Successful",
        user: {
            username: user.username,
            email: user.email
        }
    })

}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password is required."
        });
    }
    const userExisted = await userModal.findOne({ email });

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

    const token = generateAuthToken(userExisted._id.toString());

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Login Successful",
        user: {
            username: userExisted.username,
            email: userExisted.email
        }
    })

}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        message: "Logout Successful",
    });
}

export const checkAuth = (req: Request, res: Response) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    try {
        verifyAuthToken(token);
        return res.status(200).json({ success: true });
    } catch {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }
};