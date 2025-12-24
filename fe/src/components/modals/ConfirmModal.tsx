import { Save, Trash } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

const ConfirmModal = ({
  triggerButton,
  action,
  entityType,
}: {
  triggerButton: React.ReactNode;
  action: "delete" | "save";
  entityType: "article" | "user" | "comment" | "other";
}) => {
  const getModalIcon = () => {
    switch (action) {
      case "delete":
        return <Trash className="size-10 text-destructive mx-auto" />;
      case "save":
        return <Save className="size-10 text-foreground mx-auto" />;
    }
  };

  const getModalEntityType = () => {
    switch (entityType) {
      case "article":
        return "bài viết";
      case "user":
        return "người dùng";
      case "comment":
        return "bình luận";
      default:
        return "mục";
    }
  };

  const getModalTitle = (entityType: string) => {
    switch (action) {
      case "delete":
        return `Bạn có chắc chắn muốn xoá ${entityType} này?`;
      case "save":
        return "Lưu các thay đổi?";
    }
  };

  const getModalDescription = (entityType: string) => {
    switch (action) {
      case "delete":
        return `Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến ${entityType} này cũng sẽ bị xoá.`;
      case "save":
        return `Bạn có chắc chắn muốn lưu các thay đổi đã thực hiện cho ${entityType} này không?`;
    }
  };

  const modalIcon = getModalIcon();
  const modalEntityType = getModalEntityType();
  const modalTitle = getModalTitle(modalEntityType);
  const modalDescription = getModalDescription(modalEntityType);
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-center">
          {modalIcon}
          <h1 className="font-bold text-xl">{modalTitle}</h1>
          <div className="text-muted-foreground">{modalDescription}</div>
          <DialogFooter className="border-t pt-4">
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button variant="destructive">Xác nhận</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
