import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Corrida Noturna SP - 5km', description: 'Event title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Uma corrida noturna pelo centro de SP', description: 'Detailed event description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Corrida', description: 'Event category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://cdn.fomohub.com/events/image.jpg', description: 'Event image URL' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: '2026-12-31T20:00:00.000Z', description: 'Event date and time (ISO 8601, UTC)' })
  @IsDateString()
  event_date: string;

  @ApiPropertyOptional({ example: 'Parque Ibirapuera, São Paulo - SP', description: 'Event location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 200, description: 'Max participants. Null = unlimited' })
  @IsOptional()
  @IsNumber()
  max_participants?: number;

  @ApiProperty({ example: true, description: 'Whether the event is free' })
  @IsBoolean()
  is_free: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Price in BRL. Ignored if is_free=true' })
  @IsOptional()
  @IsNumber()
  price?: number;
}
