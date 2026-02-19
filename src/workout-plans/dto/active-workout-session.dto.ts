export type ActiveWorkoutSessionResponse = {
  sessionId: string;
  workoutId: string;
  workoutName: string;
  completedSets: number;
  totalSets: number;
  elapsedMinutes: number;
  exercises: Array<{
    workout_exercise_id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest_time_seconds: number;
    completed_sets: number;
  }>;
};
