import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, PenLine, Search } from "lucide-react"; // Import thêm icon
import Image from "next/image";
import Link from "next/link";
import Buttons from "./NavbarButtons";
import NavbarButtons from "./NavbarButtons";
import { getAuthServer } from "@/lib/auth-server";

const Navbar = async () => {
  const user = await getAuthServer();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 1. Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Blogify</span>
          </Link>
        </div>

        {/* 2. Search Bar (Ẩn trên mobile nhỏ, hiện trên md trở lên) */}
        <div className="hidden md:flex flex-1 items-center justify-center px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm bài viết..."
              className="w-full bg-muted/50 pl-9 focus-visible:bg-background"
            />
          </div>
        </div>
        <div className="md:hidden flex flex-1 items-center justify-center px-6">
          <div className="relative w-full max-w-md">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full p-2" align="start">
                <DropdownMenuItem>
                  <Input
                    type="search"
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full bg-muted/50 pl-9 focus-visible:bg-background"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 3. Actions */}
        <NavbarButtons user={user} />
      </div>
    </header>
  );
};

export default Navbar;
