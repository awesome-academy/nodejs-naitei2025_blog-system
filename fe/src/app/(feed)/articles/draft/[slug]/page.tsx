"use client";

import articleApi from "@/api/article.api";
import Editor from "@/components/tiptap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, use } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// 1. Cập nhật Schema: Chấp nhận cả File (upload mới) và String (URL cũ)
const schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống").max(100),
  body: z.string().min(1, "Nội dung không được để trống"),
  tagList: z.array(z.string()).max(5, "Tối đa 5 thẻ"),
  cover_image: z.union([
    z.instanceof(File, { message: "Ảnh không hợp lệ" })
      .refine((file) => file.size <= MAX_FILE_SIZE, "Kích thước ảnh tối đa là 5MB.")
      .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Định dạng không hỗ trợ."),
    z.string(), // Chấp nhận URL string
    z.null(),   // Chấp nhận null (xóa ảnh)
    z.undefined()
  ]).optional(),
});

const Page = ({ params }: { params: Promise<{ slug: string }> }) => {
  const unwrappedParams = use(params);
  const slug = decodeURIComponent(unwrappedParams.slug);
  const isCreateMode = slug === "new";

  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch, // Dùng watch để theo dõi giá trị form
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      body: "",
      tagList: [],
      cover_image: undefined as any, // Allow any initially
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState(""); // URL dùng để hiển thị preview
  const [editorContent, setEditorContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tagList, settagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const { user } = useAuth();
  const { token } = user || "";

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isCreateMode) {
        setIsLoading(true);
        try {
          const response = await articleApi.getArticleBySlug(slug);
          const article = response.data;

          reset({
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tagList,
            cover_image: article.cover_image, // Gán URL string vào form
          });

          setEditorContent(article.body);
          settagList(article.tagList);
          
          // QUAN TRỌNG: Nếu có ảnh cũ (string), set nó vào blob để hiển thị preview
          if (article.cover_image) {
            setBlob(article.cover_image);
          }
        } catch (error) {
          console.error("Lỗi tải bài viết:", error);
          router.push("/articles/draft/new"); 
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchArticle();
  }, [isCreateMode, slug, reset, router]);

  // --- XỬ LÝ ẢNH PREVIEW KHI UPLOAD MỚI ---
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setBlob(objectUrl); // Ghi đè blob bằng ảnh mới upload
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (newFile) {
      setFile(newFile);
      setValue("cover_image", newFile, { shouldValidate: true }); // Cập nhật form thành File object
    }
  };

  const removeImage = () => {
    setFile(null);
    setBlob(""); // Xóa preview
    setValue("cover_image", null, { shouldValidate: true }); // Set form về null
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  // --- SUBMIT LOGIC ---
  const onSubmit = async (data: any, status: "draft" | "pending") => {
    setIsLoading(true);
    try {
      let coverImageUrl = data.cover_image;
      
      // Logic quan trọng:
      // 1. Nếu là File -> Upload lên Cloudinary lấy URL mới
      // 2. Nếu là String -> Giữ nguyên URL cũ
      // 3. Nếu là null -> Gửi null lên server (để xóa ảnh)
      
      if (data.cover_image instanceof File) {
        const url = await articleApi.uploadImage(data.cover_image);
        if (url) {
          coverImageUrl = url;
        } else {
          throw new Error("Upload ảnh thất bại");
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        body: data.body,
        tagList: data.tagList,
        cover_image: coverImageUrl, // Lúc này chắc chắn là String hoặc Null
        status: status,
      };

      let response;
      if (isCreateMode) {
        response = await articleApi.createArticle(token, payload);
      } else {
        response = await articleApi.updateArticle(slug, token, payload);
      }

      if (response.success || response.data) {
        const actionText = status === "draft" ? "Lưu bản nháp" : "Đăng bài";
        alert(`${actionText} thành công!`);
        if (isCreateMode && response.data?.slug) {
           router.push(`/articles/draft/${response.data.slug}`);
        }
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("Có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- TAG LOGIC ---
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tagList.includes(value) && tagList.length < 5) {
        const newTags = [...tagList, value];
        settagList(newTags);
        setValue("tagList", newTags);
        setTagInput("");
      }
    }
  };
  const removeTag = (t: string) => {
    const newTags = tagList.filter(tag => tag !== t);
    settagList(newTags);
    setValue("tagList", newTags);
  };

  return (
    <form className="space-y-4">
      <div className="p-4 border rounded-lg shadow-sm">
         <div className="grid gap-3">
          <Label>Ảnh bìa</Label>
          <Input ref={inputFileRef} type="file" onChange={onFileChange} accept="image/*" />
          
          {/* Hiển thị lỗi validation nếu có */}
          {errors.cover_image && (
            <p className="text-red-500 text-sm">{errors.cover_image.message as string}</p>
          )}

          {/* Hiển thị Preview (Blob từ file mới HOẶC URL từ bài viết cũ) */}
          {blob && (
            <div className="relative mt-2 aspect-video w-full max-h-72 overflow-hidden rounded-md border">
              <Image src={blob} alt="Preview" fill className="object-cover" unoptimized />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage} type="button">
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Input style={{ fontSize: "30px" }} className="h-16 font-bold" placeholder="Tiêu đề" {...register("title")} />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
      
      {/* Tag Input */}
      <div className="space-y-2">
        <Input placeholder="Thêm thẻ..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
        <div className="flex flex-wrap gap-2">
          {tagList.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              #{tag} <button type="button" onClick={() => removeTag(tag)} className="ml-2"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <Input placeholder="Mô tả ngắn" {...register("description")} />
      {errors.description && <p className="text-red-500 text-sm">{errors.description.message as string}</p>}
      
      <Separator />
      
      <Editor content={editorContent} onChange={(content: string) => { setEditorContent(content); setValue("body", content); }} />
      {errors.body && <p className="text-red-500 text-sm">{errors.body.message as string}</p>}

      <div className="flex gap-2">
        <Button variant="ghost" type="button" disabled={isLoading} onClick={handleSubmit((data) => onSubmit(data, "draft"))}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isCreateMode ? "Lưu bản nháp" : "Cập nhật bản nháp"}
        </Button>

        <Button type="button" disabled={isLoading} onClick={handleSubmit((data) => onSubmit(data, "pending"))}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {isCreateMode ? "Đăng bài viết" : "Cập nhật & Đăng"}
        </Button>
      </div>
    </form>
  );
};

export default Page;
