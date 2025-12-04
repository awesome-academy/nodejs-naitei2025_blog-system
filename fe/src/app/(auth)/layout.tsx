"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              {children}
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/authentication-form-image.jpg"
                  fill={true}
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
};

export default Layout;
