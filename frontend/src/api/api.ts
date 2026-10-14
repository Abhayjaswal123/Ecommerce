import api from "./apiInstance";
import { isAuthUser, type AuthUser } from "../utils/authStorage";

export const getAuthUser = (response: unknown): AuthUser | null => {
  if (typeof response !== "object" || response === null) {
    return null;
  }

  const body = response as Record<string, unknown>;
  if (isAuthUser(body.user)) {
    return body.user;
  }

  if (typeof body.data === "object" && body.data !== null) {
    const nestedBody = body.data as Record<string, unknown>;
    if (isAuthUser(nestedBody.user)) {
      return nestedBody.user;
    }
  }

  return null;
};

export const userRegister = (data: {
  username: string;
  email: string;
  password: string;
  role?: "user" | "vendor";
}) => {
  return api.post<unknown>("/api/register", {
    ...data,
    role: data.role ?? "user",
  });
};

export const userLogin = (data: { email: string; password: string }) => {
  return api.post<unknown>("/api/login", data);
};

export const logout = () => {
  return api.post("/api/logout");
};