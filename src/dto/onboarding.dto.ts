import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 'Fernando', description: 'Nome social do usuário' })
  @IsOptional()
  @IsString()
  socialName: string;

  @ApiProperty({ example: '1995-06-15', description: 'Data de nascimento (YYYY-MM-DD)' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty({ example: 178, description: 'Altura em centímetros' })
  @IsNumber()
  heightCm: number;

  @ApiProperty({ example: 80.5, description: 'Peso em quilogramas' })
  @IsNumber()
  weightKg: number;

  @ApiProperty({ example: 'hipertrofia', description: 'Objetivo principal do treino' })
  @IsString()
  goal: string;

  @ApiProperty({ example: 'intermediario', description: 'Nível de experiência' })
  @IsString()
  experienceLevel: string;

  @ApiProperty({ example: '4x por semana', description: 'Frequência de treino' })
  @IsString()
  trainingFrequency: string;
}

export class ParqDto {
  @ApiProperty({ example: false, description: 'Possui condição cardíaca?' })
  @IsBoolean()
  hasHeartCondition: boolean;

  @ApiProperty({ example: false, description: 'Dor no peito durante atividade?' })
  @IsBoolean()
  chestPainDuringActivity: boolean;

  @ApiProperty({ example: false, description: 'Dor no peito no último mês?' })
  @IsBoolean()
  chestPainLastMonth: boolean;

  @ApiProperty({ example: false, description: 'Tontura ou desmaios?' })
  @IsBoolean()
  dizzinessOrFainting: boolean;

  @ApiProperty({ example: false, description: 'Problema ósseo ou articular?' })
  @IsBoolean()
  boneOrJointProblem: boolean;

  @ApiProperty({ example: false, description: 'Usa medicação cardíaca ou pressão?' })
  @IsBoolean()
  usesHeartOrPressureMedication: boolean;

  @ApiProperty({ example: false, description: 'Outro motivo para não se exercitar?' })
  @IsBoolean()
  otherReasonNotToExercise: boolean;
}

export class ConsentDto {
  @ApiProperty({ example: 'terms_of_use', description: 'Tipo do consentimento' })
  @IsString()
  type: string;

  @ApiProperty({ example: '1.0', description: 'Versão do documento de consentimento' })
  @IsString()
  version: string;

  @ApiProperty({ example: true, description: 'O usuário aceitou?' })
  @IsBoolean()
  accepted: boolean;

  @ApiProperty({ example: '2026-02-19T19:00:00.000Z', description: 'Data de aceite (ISO 8601)' })
  @IsDateString()
  acceptedAt: string;
}

export class OnboardingDto {
  @ApiProperty({ type: FitnessDataDto, description: 'Dados físicos e de objetivo do usuário' })
  @ValidateNested()
  @Type(() => FitnessDataDto)
  fitnessData: FitnessDataDto;

  @ApiProperty({ type: ParqDto, description: 'Respostas ao questionário PAR-Q' })
  @ValidateNested()
  @Type(() => ParqDto)
  parq: ParqDto;

  @ApiProperty({ type: ConsentDto, description: 'Dados de consentimento' })
  @ValidateNested()
  @Type(() => ConsentDto)
  consent: ConsentDto;
}
