export const Card = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border bg-white/80 p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80"
  >
    {children}
  </button>
);
