import React from "react";
import { cn } from "@/lib/utils";

type LimeButtonBaseProps = {
  className?: string;
  children: React.ReactNode;
};

type LimeButtonAsButton = LimeButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    as?: "button";
  };

type LimeButtonAsAnchor = LimeButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    as: "a";
    href: string;
  };

type LimeButtonProps = LimeButtonAsButton | LimeButtonAsAnchor;

const BASE_CLASSES =
  "inline-flex items-center bg-[#D4F63D] hover:bg-[#c6e930] text-black font-bold rounded-full transition-all cursor-pointer group";

export function LimeButton({ className, children, ...props }: LimeButtonProps) {
  const classes = cn(BASE_CLASSES, className);

  if (props.as === "a") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, ...anchorProps } = props;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
