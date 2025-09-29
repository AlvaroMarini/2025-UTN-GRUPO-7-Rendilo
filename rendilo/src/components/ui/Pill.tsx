import React from "react";

type PillProps = {
    children: React.ReactNode;
    intent?: "prim" | "sec" | "nav";
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
};

export const Pill = ({
                         children,
                         intent = "prim",
                         className = "",
                         onClick,
                         disabled = false,
                     }: PillProps) => {
    const base =
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition duration-200 border";

    const intentClasses =
        intent === "prim"
            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            : intent === "sec"
                ? "bg-zinc-200 text-zinc-800 border-zinc-300 hover:bg-zinc-300"
                : "bg-transparent border-transparent text-zinc-500 hover:text-blue-500 hover:border-blue-500";

    const interactiveClasses =
        onClick && !disabled
            ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white active:scale-95"
            : "cursor-default";

    const stateClasses = disabled
        ? "opacity-50 pointer-events-none"
        : "";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${intentClasses} ${interactiveClasses} ${stateClasses} ${className}`}
        >
            {children}
        </button>
    );
};
