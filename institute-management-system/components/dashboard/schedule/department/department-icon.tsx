import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { baseAPI } from "@/constants/api";
import Image from "next/image";

export function DepartmentIcon({
  imageUrl,
  imageName,
}: {
  imageUrl: string;
  imageName: string;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center `}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={imageUrl ? `${baseAPI.BASE_IMAGE}${imageUrl}` : baseAPI.NO_IMAGE}
          alt={imageName}
        />
        <AvatarFallback>{imageName?.charAt(0)}</AvatarFallback>
      </Avatar>
    </div>
  );
}
