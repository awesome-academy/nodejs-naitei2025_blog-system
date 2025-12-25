import articleApi from "@/api/article.api"; // 1. Import API để upload ảnh
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading2, Italic, List, ListOrdered, Loader2, Strikethrough, Trash2 } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";
import { Image as ImageIcon } from "lucide-react";
import { useRef, ChangeEvent, useState } from "react"; // 2. Import useState

export default function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) {
    return null;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false); // 3. State quản lý trạng thái upload

  const options = [
    {
        icon: <Heading2 />,
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        pressed: editor.isActive("heading", { level: 2 }),
    },
    {
        icon: <Bold />,
        onClick: () => editor.chain().focus().toggleBold().run(),
        pressed: editor.isActive("bold"),
    },
    {
        icon: <Italic />,
        onClick: () => editor.chain().focus().toggleItalic().run(),
        pressed: editor.isActive("italic"),
    },
    {
        icon: <Strikethrough />,
        onClick: () => editor.chain().focus().toggleStrike().run(),
        pressed: editor.isActive("strike"),
    },
    {
        icon: <AlignLeft />,
        onClick: () => editor.chain().focus().setTextAlign("left").run(),
        pressed: editor.isActive({ textAlign: "left" }),
    },
    {
        icon: <AlignCenter />,
        onClick: () => editor.chain().focus().setTextAlign("center").run(),
        pressed: editor.isActive({ textAlign: "center" }),
    },
    {
        icon: <AlignRight />,
        onClick: () => editor.chain().focus().setTextAlign("right").run(),
        pressed: editor.isActive({ textAlign: "right" }),
    },
    {
        icon: <AlignJustify />,
        onClick: () => editor.chain().focus().setTextAlign("justify").run(),
        pressed: editor.isActive({ textAlign: "justify" }),
    },
    {
        icon: <List />,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        pressed: editor.isActive("bulletList"),
    },
    {
        icon: <ListOrdered />,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        pressed: editor.isActive("orderedList"),
    },
  ]

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 4. Cập nhật logic: Upload ảnh lấy URL thay vì dùng Base64
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true); // Bật trạng thái loading
      try {
        // Lặp qua từng file được chọn
        for (const file of Array.from(files)) {
            // Gọi API upload ảnh
            const url = await articleApi.uploadImage(file);
            
            if (url) {
                // Chèn ảnh vào editor bằng URL từ server
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        alert("Không thể tải ảnh lên. Vui lòng thử lại.");
      } finally {
        setIsUploading(false); // Tắt loading
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input
        }
      }
    }
  };

  const deleteSelectedImage = () => {
    if (editor.isActive('image')) {
        editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="rounded-md border p-2 flex gap-2 flex-wrap items-center">
        {options.map((option, index) => (
            <Toggle
                key={index}
                pressed={option.pressed}
                onPressedChange={option.onClick}
                className="cursor-pointer"
            >
                {option.icon}
            </Toggle>
        ))}
        
        <button
          onClick={handleImageClick}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          type="button"
          title="Thêm ảnh"
          disabled={isUploading} // Disable nút khi đang upload
        >
          {isUploading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             <ImageIcon className="w-5 h-5" />
          )}
        </button>

        <button
            onClick={deleteSelectedImage}
            disabled={!editor.isActive('image')}
            className={`p-2 rounded ${editor.isActive('image') ? 'hover:bg-red-100 text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
            type="button"
            title="Xóa ảnh đang chọn"
        >
            <Trash2 className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple // Cho phép chọn nhiều file
          onChange={handleFileChange}
          className="hidden"
        />
    </div>
  )
}
