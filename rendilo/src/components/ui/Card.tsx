import React from "react";

type CardProps<T extends React.ElementType> = {
    as?: T;
    className?: string;
    children: React.ReactNode;
    clickable?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "clickable">;

export const Card = <T extends React.ElementType = "div">({
                                                              as,
                                                              className = "",
                                                              children,
                                                              clickable = false,
                                                              ...props
                                                          }: CardProps<T>) => {
    const Component = as || "div";

    const cursorClass =
        clickable || Component === "button" || Component === "a"
            ? "cursor-pointer"
            : "cursor-default";

    return (
        <Component
            className={`
        rounded-2xl border bg-white/80 p-4 shadow-sm transition
        hover:shadow-md dark:border-zinc-200 dark:bg-zinc-900/80
        focus:outline-none focus:ring-6 focus:ring-blue-500 
        ${cursorClass}
        ${className}
      `}
            {...(Component === "div" ? { tabIndex: 0, role: "group" } : {})}
            {...props}
        >
            {children}
        </Component>
    );
};

