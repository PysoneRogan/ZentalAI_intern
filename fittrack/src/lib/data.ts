export const today = { workouts: 1, minutes: 45, calories: 320 };
export const week = { workouts: 4, minutes: 170, calories: 1000 };
export const month = { workouts: 16, minutes: 720, calories: 4200 };

export const recentWorkouts = [
  { type: "Cardio", color: "emerald" as const, date: "2024-01-24", title: "Morning run in the park", duration: 45, calories: 320, icon: "activity" },
  { type: "Strength", color: "blue" as const, date: "2024-01-23", title: "Upper body workout", duration: 60, calories: 280, icon: "dumbbell" },
  { type: "Yoga", color: "rose" as const, date: "2024-01-22", title: "Evening relaxation session", duration: 30, calories: 150, icon: "lotus" },
];