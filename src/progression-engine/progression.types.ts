export interface ExercisePrescription {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface DayPrescription {
  dayOrder: number;
  exercises: ExercisePrescription[];
}

export interface WeekPrescription {
  weekNumber: number;
  days: DayPrescription[];
}