"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const LoginPage = ({ className, ...props }: React.ComponentProps<"form">) => {
  return (
    <form className={cn("p-6 md:p-8", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
          <p className="text-muted-foreground text-balance">
            Tham gia cộng đồng và chia sẻ câu chuyện của bạn.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Địa chỉ email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email của bạn"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-2 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Đăng nhập</Button>
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Hoặc tiếp tục với
        </FieldSeparator>
        <Field className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Đăng nhập với Facebook</span>
          </Button>
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Đăng nhập với Google</span>
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
};

export default LoginPage;
