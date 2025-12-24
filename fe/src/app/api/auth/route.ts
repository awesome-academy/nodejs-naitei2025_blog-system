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
