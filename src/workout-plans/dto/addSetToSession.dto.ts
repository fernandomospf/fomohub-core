import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class AddSetToSessionDto {
  @IsUUID()
  workout_exercise_id: string;

  @IsNumber()
  set_number: number;

  @IsNumber()
  reps: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsNumber()
  rest_seconds?: number;
}
