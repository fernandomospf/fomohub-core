export class CreateWorkoutExerciseDto {
  name: string;
  sets: number;
  reps?: number;
  weight?: number;
  restTimeSeconds?: number;
  notes?: string;
}
