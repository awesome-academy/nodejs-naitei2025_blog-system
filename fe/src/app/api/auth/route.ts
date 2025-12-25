import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Token received" },
      {
        status: 200,
        headers: { "Set-Cookie": `token=${token}; Path=/; HttpOnly` },
      }
    );
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Internal Server Error";

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Xóa cookie bằng cách set value rỗng và maxAge = 0
    response.cookies.set({
      name: "token",
      value: "",
      path: "/",
      httpOnly: true,
      maxAge: 0, // Cookie hết hạn ngay lập tức
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}
