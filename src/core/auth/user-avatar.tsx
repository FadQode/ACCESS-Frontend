import type { AuthUser } from "@/core/dashboard/model/types/auth.types";

export type UserAvatarProps = {
  size?: "sm" | "md";
  user?: Partial<Pick<AuthUser, "name" | "email">> | null;
};

const SIZE_CLASS = {
  md: "h-9 w-9 text-xs",
  sm: "h-7 w-7 text-[10px]",
};

export function UserAvatar({ size = "sm", user }: UserAvatarProps) {
  const label = user?.name || user?.email || "User";

  return (
    <span
      aria-label={label}
      className={`${SIZE_CLASS[size]} flex shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] font-semibold text-white`}
      role="img"
    >
      {initialsFromName(label)}
    </span>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
