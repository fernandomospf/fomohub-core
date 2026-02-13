import { IsNumber, IsString } from 'class-validator';

export class GenerateWorkoutDto {
  @IsNumber()
  age: number;

  @IsString()
  goal: string;

  @IsString()
  level: string;

  @IsNumber()
  time: number;
}
