import { IsDate, IsNumber, IsOptional } from "class-validator";

export class UpdateMeasurementsDto {
  @IsNumber()
  @IsOptional()
  chest_cm?: number;

  @IsNumber()
  @IsOptional()
  biceps_right_cm?: number;

  @IsNumber()
  @IsOptional()
  biceps_left_cm?: number;

  @IsNumber()
  @IsOptional()
  waist_abdomen_cm?: number;

  @IsNumber()
  @IsOptional()
  thigh_right_cm?: number;

  @IsNumber()
  @IsOptional()
  thigh_left_cm?: number;

  @IsNumber()
  @IsOptional()
  calf_right_cm?: number;

  @IsNumber()
  @IsOptional()
  calf_left_cm?: number;

  @IsNumber()
  @IsOptional()
  forearm_left_cm?: number;

  @IsNumber()
  @IsOptional()
  forearm_right_cm?: number;

  @IsNumber()
  @IsOptional()
  hip_cm?: number;

  @IsDate()
  @IsOptional()
  created_at?: Date;

  @IsNumber()
  @IsOptional()
  weight_kg?: number;

  @IsDate()
  @IsOptional()
  measured_at?: Date;
}