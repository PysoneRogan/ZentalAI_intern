'use client';

import { useState, useEffect } from 'react';
import StatCard from "@/components/StatCard";
import Section from "@/components/Section";
import WorkoutItem from "@/components/WorkoutItem";
import Button from "@/components/Button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { CalendarIcon, TrendingUpIcon, TargetIcon, PlusIcon, SparklesIcon, ActivityIcon, DumbbellIcon, LotusIcon } from "@/components/icons";
import { today, week, month } from "@/lib/data";

interface Workout {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  notes?: string;
}

export default function Home() {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    // Load workouts from localStorage on component mount
    const savedWorkouts = localStorage.getItem('recentWorkouts');
    if (savedWorkouts) {
      setRecentWorkouts(JSON.parse(savedWorkouts));
    }
  }, []);

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio':
      case 'running':
      case 'cycling':
        return <ActivityIcon className="h-5 w-5" />;
      case 'strength':
        return <DumbbellIcon className="h-5 w-5" />;
      case 'yoga':
        return <LotusIcon className="h-5 w-5" />;
      default:
        return <ActivityIcon className="h-5 w-5" />;
    }
  };

  const getWorkoutColor = (type: string): "emerald" | "blue" | "rose" => {
    switch (type) {
      case 'cardio':
      case 'running':
      case 'cycling':
        return 'emerald';
      case 'strength':
        return 'blue';
      case 'yoga':
        return 'rose';
      default:
        return 'emerald';
    }
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-800">FitTrack Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Track your fitness journey and achieve your goals</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Button variant="primary" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            <a href="/add-workout" className="no-underline text-white">Add Workout</a>
          </Button>
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

      <Section title="Recent Workouts" icon={<span className="text-slate-600 dark:text-slate-400">🏋️</span>}>
        <div className="space-y-3">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.slice(0, 5).map((workout) => (
              <WorkoutItem
                key={workout.id}
                icon={getWorkoutIcon(workout.type)}
                label={workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                color={getWorkoutColor(workout.type)}
                date={workout.date}
                title={workout.notes || `${workout.type} workout`}
                durationMin={workout.duration}
                calories={workout.calories}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No workouts logged yet.</p>
              <Button variant="outline" className="mt-4">
                <a href="/add-workout" className="no-underline">Add Your First Workout</a>
              </Button>
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}