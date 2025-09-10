export const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={
      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow-sm " +
      "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 " +
      "dark:bg-zinc-900/70 dark:border-zinc-800 " +
      className
    }
  >
    {children}
  </span>
);
