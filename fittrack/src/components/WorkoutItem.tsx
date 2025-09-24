import Badge from "@/components/Badge";

type WorkoutItemProps = {
  icon: React.ReactNode;
  label: string; // Cardio, Strength, Yoga
  color: "emerald" | "blue" | "rose";
  date: string; // YYYY-MM-DD
  title: string;
  durationMin: number;
  calories: number;
};

export default function WorkoutItem({ icon, label, color, date, title, durationMin, calories }: WorkoutItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Badge color={color}>{label}</Badge>
            <span className="text-slate-500">{date}</span>
          </div>
          <p className="text-slate-800">{title}</p>
        </div>
      </div>
      <div className="text-right text-sm text-slate-600">
        <div className="font-medium text-slate-800">{durationMin} min</div>
        <div>{calories} cal</div>
      </div>
    </div>
  );
}