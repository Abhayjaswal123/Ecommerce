import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .transform((value) => value.toLowerCase()),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(20, "Username cannot exceed 20 characters.")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores."
        ),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(72, "Password cannot exceed 72 characters."),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;