import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary: "bg-leaf-700 text-white shadow-sm hover:bg-leaf-500",
  secondary: "border border-leaf-100 bg-white text-leaf-700 hover:border-leaf-500 hover:bg-leaf-50",
  ghost: "text-leaf-700 hover:bg-leaf-50"
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
