import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true
});

export default api;