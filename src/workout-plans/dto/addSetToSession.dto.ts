import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class AddSetToSessionDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID do exercício no plano de treino' })
  @IsUUID()
  workout_exercise_id: string;

  @ApiProperty({ example: 1, description: 'Número da série executada' })
  @IsNumber()
  set_number: number;

  @ApiProperty({ example: 12, description: 'Número de repetições realizadas' })
  @IsNumber()
  reps: number;

  @ApiProperty({ example: 80.0, description: 'Carga utilizada (kg)' })
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ example: 90, description: 'Descanso em segundos' })
  @IsOptional()
  @IsNumber()
  rest_seconds?: number;
}
