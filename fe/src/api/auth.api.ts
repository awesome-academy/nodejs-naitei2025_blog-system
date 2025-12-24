import http from "@/lib/http";

const authApi = {
  login: (body) => http.post("/users/login", body),
  register: (body) => http.post("/users/register", body),
  auth: (body: { token: string }) =>
    http.post("/api/auth", body, { baseURL: "" }),
};
export default authApi;