"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenIcon, Loader2, Upload } from "lucide-react";
import userApi from "@/api/user.api"; // Import userApi

// 1. Định nghĩa Schema với Zod
const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  bio: z.string().optional(),
  password: z.string().optional(),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  user: any;
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user.image || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      password: "",
      image: user.image || "",
    },
  });

  // 3. Hàm upload ảnh sử dụng userApi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiển thị preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    setIsUploading(true);
    try {
      // Gọi hàm uploadImage từ userApi
      const imageUrl = await userApi.uploadImage(file);
      
      if (imageUrl) {
        // Gán URL ảnh vào form value
        setValue("image", imageUrl); 
      } else {
        alert("Upload ảnh thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Có lỗi xảy ra khi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Hàm submit form
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      console.log("Submitting data:", payload);
      
      const response = await userApi.updateUser(user.token, payload);

      if (!response.success) {
        throw new Error(response.error || "Cập nhật thất bại");
      }
      
      setIsOpen(false);
      window.location.reload(); // Reload trang để cập nhật thông tin mới
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PenIcon className="mr-2 h-4 w-4" />
          Chỉnh sửa hồ sơ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cá nhân của bạn tại đây.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-24 w-24 border-2 border-gray-100">
              <AvatarImage src={previewImage || "/user_default.jpg"} className="object-cover" />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? "Đang tải lên..." : "Đổi ảnh đại diện"}
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên của bạn"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          {/* Username Field */}
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Nhập username"
            />
            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
          </div>

          {/* Bio Field */}
          <div className="grid gap-2">
            <Label htmlFor="bio">Tiểu sử (Bio)</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Giới thiệu đôi chút về bản thân..."
              className="resize-none"
            />
          </div>

          {/* Password Field */}
          <div className="grid gap-2">
            <Label htmlFor="password">Mật khẩu mới</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Để trống nếu không muốn đổi"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}