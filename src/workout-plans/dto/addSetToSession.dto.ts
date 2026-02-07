export class AddSetToSessionDto {
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds?: number;
}
