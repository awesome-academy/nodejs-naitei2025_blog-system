import Navbar from "@/components/navbar/Navbar";
import "./globals.css";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { cookies } from "next/headers";
import { getAuthServer } from "@/lib/auth-server";

const geist = Geist({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthServer();
  return (
    <html lang="en">
      <AuthProvider initialUser={user}>
        <body className={`${geist.className} min-h-screen bg-background`}>
          {children}
        </body>
      </AuthProvider>
    </html>
  );
}
