import {
  CreateUser,
  UserBasic,
  UserDetail,
  UserListItem,
} from "@/interfaces/user.interface";
import http from "@/lib/http";

const userApi = {
  countUser: (token: string) =>
    http.get<{ total: number }>("/user/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  createUser: (payload) => http.post<CreateUser>("/user/user", payload),
  getUsers: (token: string) =>
    http.get<UserListItem[]>("/user/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  getMe: (token: string) =>
    http.get<UserDetail>("/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  getProfile: (token?: string, username: string) =>
    http.get<UserDetail>(`/profiles/${username}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }),
  uploadImage: async (image: File) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      // SỬA: Định nghĩa folder vào biến để đảm bảo đồng nhất
      const folder = "blog/user";

      // 1. Chuẩn bị các tham số cần ký
      const paramsToSign = {
        timestamp: timestamp,
        folder: folder,
      };

      // 2. Gọi API nội bộ của Next.js để lấy chữ ký
      const res = await fetch("/api/sign-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!res.ok) {
        throw new Error("Failed to sign request");
      }

      const { signature } = await res.json();

      // 3. Upload lên Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string
      );
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      // SỬA: Dùng đúng biến folder đã khai báo ở trên
      formData.append("folder", folder);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.secure_url;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      return null;
    }
  },
  updateUser: async (token: string, payload: any) =>
    http.put<UserDetail>(
      "/user",
      { ...payload },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  followUser: (token: string, username: string) =>
    http.post<UserBasic>(
      `/profiles/${username}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  unfollowUser: (token: string, username: string) =>
    http.post<UserBasic>(
      `/profiles/${username}/unfollow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
};
export default userApi;
