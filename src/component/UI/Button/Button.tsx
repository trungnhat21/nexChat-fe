import type React from "react"

type ButtonProps = {
    children: React.ReactNode; // dùng để xác định children trong component ( ví dụ text đăng nhập)
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
    loadding?: boolean
}

export default function Button({
    children,
    className = "",
    onClick,
    type = "button",
    loadding
}: ButtonProps) {
    return (
        <button className={className} onClick={onClick} type={type} disabled={loadding}>
            {loadding ? "Please wait..." : children}
        </button>
    )
}