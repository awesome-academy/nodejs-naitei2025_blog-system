import { cookies } from "next/headers";
import Sidebar from "./ProfileSidebar";
import userApi from "@/api/user.api";
import { HttpError } from "@/lib/http";
import { notFound, redirect } from "next/navigation";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>; // SỬA 1: params là Promise trong Next.js 15+
}) {
  const { username } = await params; // SỬA 2: await params
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user;
  try {
    if (username === "me") {
      const response = await userApi.getMe(token);
      console.log(response);
      if (response.success) {
        user = { ...response.data, token: token };
      } else {
        // SỬA 3: Xóa alert() vì server không chạy được alert
        // Thay bằng throw error để nhảy xuống catch hoặc xử lý redirect
        console.error("Get Me Error:", response.error);
        throw new Error(response.error || "Không thể lấy thông tin người dùng");
      }
    } else {
      const response = await userApi.getProfile(token, username);
      if (response.success) {
        user = response.data;
      } else {
        // SỬA 4: Xóa alert()
        console.error("Get Profile Error:", response.error);
        // Nếu API trả về lỗi logic (ví dụ user không tồn tại nhưng status vẫn 200)
        if (response.error === "User not found") notFound();
        throw new Error(response.error || "Không thể lấy profile");
      }
    }
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        notFound();
      }
      if (error.status === 401) {
        redirect("/login");
      }
    }

    console.error("Layout Error:", error);

    // Fallback UI đơn giản nếu lỗi quá nghiêm trọng
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-500">Đã xảy ra lỗi</h2>
        <p className="text-gray-600">Không thể tải thông tin người dùng.</p>
      </div>
    );
  }

  return (
    <div className="grid md:flex gap-6 p-6">
      <Sidebar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
