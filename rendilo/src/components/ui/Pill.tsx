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

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-primary'
        >
            {children}
        </button>
    );
};
