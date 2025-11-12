type BadgeProps = {
  children: React.ReactNode;
  color?: "emerald" | "blue" | "rose" | "slate";
};

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  rose: "bg-rose-100 text-rose-800",
  slate: "bg-slate-100 text-slate-800",
};

export default function Badge({ children, color = "slate" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[color]}`}>
      {children}
    </span>
  );
}