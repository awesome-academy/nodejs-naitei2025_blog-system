import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Highlighter, Italic, List, ListOrdered, Strikethrough, Trash2 } from "lucide-react"; // 1. Import Trash2
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";
import { Image as ImageIcon } from "lucide-react";
import { useRef, ChangeEvent } from "react";

export default function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) {
    return null;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 2. Cập nhật hàm xử lý file để hỗ trợ nhiều ảnh
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Lặp qua từng file được chọn
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          // Chèn ảnh vào vị trí con trỏ hiện tại
          editor.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      });
    }
    
    event.target.value = "";
  };

  // 3. Hàm xóa ảnh đang được chọn
  const deleteSelectedImage = () => {
    if (editor.isActive('image')) {
        editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="rounded-md border p-2 flex gap-2 flex-wrap">
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
          className="p-2 rounded hover:bg-gray-100"
          type="button"
          title="Thêm ảnh"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* 4. Nút xóa ảnh (chỉ hiện hoặc active khi đang chọn ảnh) */}
        <button
            onClick={deleteSelectedImage}
            disabled={!editor.isActive('image')} // Disable nếu không chọn ảnh
            className={`p-2 rounded ${editor.isActive('image') ? 'hover:bg-red-100 text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
            type="button"
            title="Xóa ảnh đang chọn"
        >
            <Trash2 className="w-5 h-5" />
        </button>

        {/* 5. Thêm thuộc tính multiple */}
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
