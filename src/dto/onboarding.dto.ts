import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FitnessDataDto {
  @IsOptional()
  @IsString()
  socialName: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsNumber()
  heightCm: number;

  @IsNumber()
  weightKg: number;

  @IsString()
  goal: string;

  @IsString()
  experienceLevel: string;

  @IsString()
  trainingFrequency: string;
}

export class ParqDto {
  @IsBoolean()
  hasHeartCondition: boolean;

  @IsBoolean()
  chestPainDuringActivity: boolean;

  @IsBoolean()
  chestPainLastMonth: boolean;

  @IsBoolean()
  dizzinessOrFainting: boolean;

  @IsBoolean()
  boneOrJointProblem: boolean;

  @IsBoolean()
  usesHeartOrPressureMedication: boolean;

  @IsBoolean()
  otherReasonNotToExercise: boolean;
}

export class ConsentDto {
  @IsString()
  type: string;

  @IsString()
  version: string;

  @IsBoolean()
  accepted: boolean;

  @IsDateString()
  acceptedAt: string;
}

export class OnboardingDto {
  @ValidateNested()
  @Type(() => FitnessDataDto)
  fitnessData: FitnessDataDto;

  @ValidateNested()
  @Type(() => ParqDto)
  parq: ParqDto;

  @ValidateNested()
  @Type(() => ConsentDto)
  consent: ConsentDto;
}
