import { cookies } from "next/headers";

export const getAuthServer = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const user = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 3600 },
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }
      const payload = await res.json();
      return { ...payload.data, token }; // Trả về cả token để tiện sử dụng sau này
    })
    .catch(() => {
      return null;
    }); // Trả về null nếu có lỗi (ví dụ: không đăng nhập)
  return user;
};
