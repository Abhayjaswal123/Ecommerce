export type AuthUser = {
  username: string;
  email: string;
  role?: "user" | "vendor";
};

export const isAuthUser = (value: unknown): value is AuthUser => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    (user.role === undefined || user.role === "user" || user.role === "vendor")
  );
};

export const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    const user: unknown = JSON.parse(storedUser);
    if (isAuthUser(user)) {
      return user;
    }
  } catch {
    // Clear values written by older code when the response did not include a user.
  }

  localStorage.removeItem("user");
  return null;
};

export const saveUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};
