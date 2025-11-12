type StatCardProps = {
  title: string;
  value: string;
  meta: string;
  icon?: React.ReactNode;
  variant?: "neutral" | "success" | "rose";
};

const variantMap: Record<NonNullable<StatCardProps["variant"]>, string> = {
  neutral: "bg-stone-100",
  success: "bg-emerald-100",
  rose: "bg-rose-100",
};

export default function StatCard({ title, value, meta, icon, variant = "neutral" }: StatCardProps) {
  return (
    <div className={`rounded-xl p-6 ${variantMap[variant]} text-slate-900 shadow-sm`}> 
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
          <p className="mt-1 text-sm text-slate-600">{meta}</p>
        </div>
        {icon ? <div className="text-slate-700">{icon}</div> : null}
      </div>
    </div>
  );
}