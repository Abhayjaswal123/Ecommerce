import api from "./apiInstance";

export const userRegister = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return api.post("/api/register", data);
};

export const userLogin = (data: { email: string; password: string }) => {
  return api.post("/api/login", data);
};

export const logout = () => {
  return api.post("/api/logout");
};