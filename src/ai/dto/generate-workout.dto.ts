import { IsArray, IsNumber, IsString } from 'class-validator';

export class GenerateWorkoutDto {
  @IsString()
  goal: string;

  @IsNumber()
  time: number;

  @IsArray()
  @IsString({ each: true })
  muscles: string[];
}
