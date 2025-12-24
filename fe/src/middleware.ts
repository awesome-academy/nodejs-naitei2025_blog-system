import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/profile/me"]; // Thêm các path cần bảo vệ
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Chỉ lấy token từ cookie, không gọi API check user ở đây để tránh chậm
  const token = request.cookies.get("token")?.value;

  // 1. Chưa đăng nhập (không có token) mà vào trang private -> đá về login
  if (privatePaths.some((path) => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Đã đăng nhập (có token) mà vào login/register -> đá về home (hoặc trang me)
  if (authPaths.some((path) => pathname.startsWith(path)) && token) {
    return NextResponse.redirect(new URL("/profile/me", request.url));
  }

  return NextResponse.next();
}

// Config matcher để middleware chạy trên các route này
export const config = {
  matcher: ["/profile/me", "/login", "/register"],
};