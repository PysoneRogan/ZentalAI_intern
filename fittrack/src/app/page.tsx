import StatCard from "@/components/StatCard";
import Section from "@/components/Section";
import WorkoutItem from "@/components/WorkoutItem";
import { CalendarIcon, TrendingUpIcon, TargetIcon, PlusIcon, SparklesIcon, ActivityIcon, DumbbellIcon, LotusIcon } from "@/components/icons";
import { today, week, month, recentWorkouts } from "@/lib/data";

export default function Home() {
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">FitTrack Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Track your fitness journey and achieve your goals</p>
        </div>

      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Today"
          value={`${today.workouts} Workout`}
          meta={`${today.minutes} min    ${today.calories} cal`}
          icon={<CalendarIcon className="h-5 w-5" />}
          variant="neutral"
        />
        <StatCard
          title="This Week"
          value={`${week.workouts} Workouts`}
          meta={`${week.minutes} min    ${week.calories} cal`}
          icon={<TrendingUpIcon className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="This Month"
          value={`${month.workouts} Workouts`}
          meta={`${month.minutes} min    ${month.calories} cal`}
          icon={<TargetIcon className="h-5 w-5" />}
          variant="rose"
        />
      </div>

      <Section title="Recent Workouts" icon={<span className="text-slate-600">{/* decorative */}🏋️</span>}>
        <div className="space-y-3">
          {recentWorkouts.map((w, idx) => (
            <WorkoutItem
              key={idx}
              icon={w.icon === "activity" ? <ActivityIcon className="h-5 w-5" /> : w.icon === "dumbbell" ? <DumbbellIcon className="h-5 w-5" /> : <LotusIcon className="h-5 w-5" />}
              label={w.type}
              color={w.color}
              date={w.date}
              title={w.title}
              durationMin={w.duration}
              calories={w.calories}
            />
          ))}
        </div>
      </Section>
    </main>
  );
}