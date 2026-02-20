import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class UpdateMeasurementsDto {
  @ApiPropertyOptional({ example: 100.5, description: 'Peitoral (cm)' })
  @IsNumber()
  @IsOptional()
  chest_cm?: number;

  @ApiPropertyOptional({ example: 36.0, description: 'Bíceps direito (cm)' })
  @IsNumber()
  @IsOptional()
  biceps_right_cm?: number;

  @ApiPropertyOptional({ example: 35.5, description: 'Bíceps esquerdo (cm)' })
  @IsNumber()
  @IsOptional()
  biceps_left_cm?: number;

  @ApiPropertyOptional({ example: 82.0, description: 'Cintura/abdômen (cm)' })
  @IsNumber()
  @IsOptional()
  waist_abdomen_cm?: number;

  @ApiPropertyOptional({ example: 58.0, description: 'Coxa direita (cm)' })
  @IsNumber()
  @IsOptional()
  thigh_right_cm?: number;

  @ApiPropertyOptional({ example: 57.5, description: 'Coxa esquerda (cm)' })
  @IsNumber()
  @IsOptional()
  thigh_left_cm?: number;

  @ApiPropertyOptional({ example: 38.0, description: 'Panturrilha direita (cm)' })
  @IsNumber()
  @IsOptional()
  calf_right_cm?: number;

  @ApiPropertyOptional({ example: 37.5, description: 'Panturrilha esquerda (cm)' })
  @IsNumber()
  @IsOptional()
  calf_left_cm?: number;

  @ApiPropertyOptional({ example: 29.0, description: 'Antebraço esquerdo (cm)' })
  @IsNumber()
  @IsOptional()
  forearm_left_cm?: number;

  @ApiPropertyOptional({ example: 29.5, description: 'Antebraço direito (cm)' })
  @IsNumber()
  @IsOptional()
  forearm_right_cm?: number;

  @ApiPropertyOptional({ example: 95.0, description: 'Quadril (cm)' })
  @IsNumber()
  @IsOptional()
  hip_cm?: number;

  @ApiPropertyOptional({ example: '2026-02-19', description: 'Data da criação do registro' })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({ example: 80.5, description: 'Peso atual (kg)' })
  @IsNumber()
  @IsOptional()
  weight_kg?: number;

  @ApiPropertyOptional({ example: '2026-02-19', description: 'Data da medição' })
  @IsDate()
  @IsOptional()
  measured_at?: Date;
}