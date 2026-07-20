export function ResponsiveGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  const colsClass = cols === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2";
  return <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>{children}</div>;
}
